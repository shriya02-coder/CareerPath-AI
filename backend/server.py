from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List, Optional
import asyncio

# Import our custom modules
from models import (
    IdentityGenerationRequest, IdentityGenerationResponse,
    ResumeOptimizationRequest, ResumeOptimizationResponse,
    CoverLetterRequest, CoverLetterResponse,
    CareerRecommendationRequest, CareerRecommendationResponse,
    Career, RewriteBulletRequest, RewriteBulletResponse
)
from database import DatabaseService
from ai_service import AIService

# New imports for file parsing (legacy)
from io import BytesIO
try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None
try:
    import docx
except Exception:
    docx = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

db_service = DatabaseService()
ai_service = AIService()

app = FastAPI(title="CareerPath AI Lite API", version="1.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await db_service.connect()
    logger.info("CareerPath AI Lite API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    await db_service.close()
    logger.info("CareerPath AI Lite API shut down")

@api_router.get("/")
async def root():
    return {"message": "CareerPath AI Lite API is running", "status": "healthy"}

# Identity
@api_router.post("/identity/generate", response_model=IdentityGenerationResponse)
async def generate_identity(request: IdentityGenerationRequest):
    try:
        user_data = request.dict()
        identity_statement = await ai_service.generate_career_identity(user_data)
        return IdentityGenerationResponse(success=True, statement=identity_statement, message="OK")
    except Exception as e:
        logger.error(f"Error generating identity: {str(e)}")
        return IdentityGenerationResponse(success=False, statement="", message="Failed to generate")

# Careers
@api_router.get("/careers")
async def get_careers(search: Optional[str] = None, category: Optional[str] = None, limit: int = 50):
    """Get careers with optional search and filtering"""
    try:
        careers = await db_service.get_careers(search=search, category=category, limit=limit)
        return {"success": True, "careers": careers, "count": len(careers)}
        
    except Exception as e:
        logger.error(f"Error getting careers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch careers")

# Place categories endpoint BEFORE dynamic id route to avoid shadowing
@api_router.get("/careers/categories")
async def get_career_categories():
    """Get all available career categories"""
    try:
        categories = await db_service.get_career_categories()
        logger.info(f"Categories fetched: {categories}")
        return {"success": True, "categories": categories}
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch career categories")

@api_router.get("/careers/{career_id}")
async def get_career_detail(career_id: str):
    """Get detailed information about a specific career"""
    try:
        career = await db_service.get_career_by_id(career_id)
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")
        
        return {"success": True, "career": career}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting career detail: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch career details")

# Legacy resume parser (frontend no longer uses this)
@api_router.post("/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    try:
        filename = file.filename or "uploaded_file"
        content_type = file.content_type or "application/octet-stream"
        raw_bytes = await file.read()
        text = ""
        if content_type.startswith("text/") or filename.lower().endswith((".txt", ".md")):
            try:
                text = raw_bytes.decode("utf-8", errors="replace")
            except Exception:
                text = raw_bytes.decode("latin-1", errors="replace")
        elif content_type == "application/pdf" or filename.lower().endswith(".pdf"):
            if not PdfReader:
                raise HTTPException(status_code=500, detail="PDF parser not available on server")
            from pypdf import PdfReader as Reader
            pdf_reader = Reader(BytesIO(raw_bytes))
            pages = []
            for page in pdf_reader.pages:
                try:
                    pages.append(page.extract_text() or "")
                except Exception:
                    pages.append("")
            text = "\n".join(pages)
        elif (
            content_type in [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword"
            ]
            or filename.lower().endswith(".docx")
        ):
            try:
                import docx as docxlib
                document = docxlib.Document(BytesIO(raw_bytes))
                text = "\n".join([p.text for p in document.paragraphs])
            except Exception as e:
                logger.error(f"DOCX parse failed: {e}")
                raise HTTPException(status_code=400, detail="Failed to extract text from DOCX.")
        else:
            raise HTTPException(status_code=415, detail="Unsupported file type.")
        text = (text or "").strip()
        if len(text) > 20000:
            text = text[:20000] + "\n\n[Truncated due to size limit]"
        return {"success": True, "filename": filename, "extractedText": text}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing resume: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal error while parsing resume")

# Resume & Cover Letter
@api_router.post("/resume/optimize", response_model=ResumeOptimizationResponse)
async def optimize_resume(request: ResumeOptimizationRequest):
    try:
        job_info = request.dict()
        result = await ai_service.optimize_resume(job_info)
        return ResumeOptimizationResponse(
            success=True,
            optimizedContent=result.get("optimizedContent", ""),
            optimizedGuide=result.get("optimizedGuide"),
            suggestions=result.get("suggestions", []),
            bulletEdits=result.get("bulletEdits", []),
            jobEdits=result.get("jobEdits", []),
            proTips=result.get("proTips", []),
            message="Resume optimization completed successfully"
        )
    except Exception as e:
        logger.error(f"Error optimizing resume: {str(e)}")
        return ResumeOptimizationResponse(
            success=False,
            optimizedContent="",
            suggestions=[],
            bulletEdits=[],
            jobEdits=[],
            proTips=[],
            message="Failed to optimize resume. Please try again."
        )

@api_router.post("/resume/rewrite-bullet", response_model=RewriteBulletResponse)
async def rewrite_bullet(request: RewriteBulletRequest):
    try:
        job_info = {
            "jobTitle": request.jobTitle,
            "company": request.company,
            "jobDescription": request.jobDescription,
        }
        data = await ai_service.rewrite_bullet(job_info, request.original, request.context)
        return RewriteBulletResponse(success=True, improved=data["improved"], rationale=data["rationale"], keywords=data.get("keywords", []))
    except Exception as e:
        logger.error(f"Error rewriting bullet: {str(e)}")
        return RewriteBulletResponse(success=False, improved=request.original, rationale="", keywords=[], message="Failed to rewrite")

@api_router.post("/resume/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest):
    try:
        job_info = {
            "jobTitle": request.jobTitle,
            "company": request.company,
            "jobDescription": request.jobDescription
        }
        cover_letter = await ai_service.generate_cover_letter(job_info, request.userProfile)
        return CoverLetterResponse(success=True, coverLetter=cover_letter, message="Cover letter generated successfully")
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        return CoverLetterResponse(success=False, coverLetter="", message="Failed to generate cover letter. Please try again.")

@api_router.post("/careers/recommend", response_model=CareerRecommendationResponse)
async def get_career_recommendations(request: CareerRecommendationRequest):
    try:
        careers = await db_service.get_careers(limit=100)
        recommendations = []
        match_scores = {}
        user_profile_dict = request.userProfile.dict()
        for career in careers[:10]:
            match_score = await ai_service.analyze_career_match(user_profile_dict, career)
            match_scores[career["id"]] = match_score
            if match_score >= 60:
                recommendations.append({
                    "career": career,
                    "matchScore": match_score,
                    "matchReasons": [
                        "Skills alignment" if match_score >= 80 else "Potential for skill development",
                        "Growth opportunity in your field",
                        "Matches your experience level"
                    ]
                })
        recommendations.sort(key=lambda x: x["matchScore"], reverse=True)
        return CareerRecommendationResponse(success=True, recommendations=recommendations[:5], matchScores=match_scores, message="Career recommendations generated successfully")
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return CareerRecommendationResponse(success=False, recommendations=[], matchScores={}, message="Failed to generate career recommendations. Please try again.")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})