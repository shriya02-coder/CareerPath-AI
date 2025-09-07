from fastapi import FastAPI, APIRouter, HTTPException, Depends
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
    Career
)
from database import DatabaseService
from ai_service import AIService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize services
db_service = DatabaseService()
ai_service = AIService()

# Create the main app
app = FastAPI(title="CareerPath AI Lite API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup event
@app.on_event("startup")
async def startup_event():
    await db_service.connect()
    logger.info("CareerPath AI Lite API started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    await db_service.close()
    logger.info("CareerPath AI Lite API shut down")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "CareerPath AI Lite API is running", "status": "healthy"}

# Career Identity Endpoints
@api_router.post("/identity/generate", response_model=IdentityGenerationResponse)
async def generate_identity(request: IdentityGenerationRequest):
    """Generate a personalized career identity statement using AI"""
    try:
        user_data = {
            "currentRole": request.currentRole,
            "yearsExperience": request.yearsExperience,
            "education": request.education,
            "selectedSkills": request.selectedSkills,
            "interests": request.interests,
            "achievements": request.achievements,
            "careerGoals": request.careerGoals
        }
        
        identity_statement = await ai_service.generate_career_identity(user_data)
        
        return IdentityGenerationResponse(
            success=True,
            statement=identity_statement,
            message="Career identity statement generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error generating identity: {str(e)}")
        return IdentityGenerationResponse(
            success=False,
            statement="",
            message="Failed to generate career identity statement. Please try again."
        )

# Career Data Endpoints
@api_router.get("/careers")
async def get_careers(search: Optional[str] = None, category: Optional[str] = None, limit: int = 50):
    """Get careers with optional search and filtering"""
    try:
        careers = await db_service.get_careers(search=search, category=category, limit=limit)
        return {"success": True, "careers": careers, "count": len(careers)}
        
    except Exception as e:
        logger.error(f"Error getting careers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch careers")

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

@api_router.get("/careers/categories")
async def get_career_categories():
    """Get all available career categories"""
    try:
        categories = await db_service.get_career_categories()
        return {"success": True, "categories": categories}
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch career categories")

# Resume & Cover Letter Endpoints
@api_router.post("/resume/optimize", response_model=ResumeOptimizationResponse)
async def optimize_resume(request: ResumeOptimizationRequest):
    """Optimize resume content using AI"""
    try:
        job_info = {
            "jobTitle": request.jobTitle,
            "company": request.company,
            "jobDescription": request.jobDescription,
            "currentResume": request.currentResume
        }
        
        optimization_result = await ai_service.optimize_resume(job_info)
        
        return ResumeOptimizationResponse(
            success=True,
            optimizedContent=optimization_result["optimizedContent"],
            suggestions=optimization_result["suggestions"],
            message="Resume optimization completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error optimizing resume: {str(e)}")
        return ResumeOptimizationResponse(
            success=False,
            optimizedContent="",
            suggestions=[],
            message="Failed to optimize resume. Please try again."
        )

@api_router.post("/resume/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate a personalized cover letter using AI"""
    try:
        job_info = {
            "jobTitle": request.jobTitle,
            "company": request.company,
            "jobDescription": request.jobDescription
        }
        
        cover_letter = await ai_service.generate_cover_letter(job_info, request.userProfile)
        
        return CoverLetterResponse(
            success=True,
            coverLetter=cover_letter,
            message="Cover letter generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        return CoverLetterResponse(
            success=False,
            coverLetter="",
            message="Failed to generate cover letter. Please try again."
        )

# Career Recommendations Endpoint
@api_router.post("/careers/recommend", response_model=CareerRecommendationResponse)
async def get_career_recommendations(request: CareerRecommendationRequest):
    """Get AI-powered career recommendations based on user profile"""
    try:
        # Get all careers
        careers = await db_service.get_careers(limit=100)
        
        # Calculate match scores for each career
        recommendations = []
        match_scores = {}
        
        user_profile_dict = request.userProfile.dict()
        
        for career in careers[:10]:  # Limit to top 10 for performance
            match_score = await ai_service.analyze_career_match(user_profile_dict, career)
            match_scores[career["id"]] = match_score
            
            if match_score >= 60:  # Only recommend careers with 60%+ match
                recommendations.append({
                    "career": career,
                    "matchScore": match_score,
                    "matchReasons": [
                        "Skills alignment" if match_score >= 80 else "Potential for skill development",
                        "Growth opportunity in your field",
                        "Matches your experience level"
                    ]
                })
        
        # Sort by match score
        recommendations.sort(key=lambda x: x["matchScore"], reverse=True)
        
        return CareerRecommendationResponse(
            success=True,
            recommendations=recommendations[:5],  # Return top 5
            matchScores=match_scores,
            message="Career recommendations generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return CareerRecommendationResponse(
            success=False,
            recommendations=[],
            matchScores={},
            message="Failed to generate career recommendations. Please try again."
        )

# Include the router in the main app
app.include_router(api_router)

# CORS middleware - ALLOW ALL ORIGINS FOR DEVELOPMENT
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"}
    )
