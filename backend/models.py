from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

# User Models
class UserProfile(BaseModel):
    name: Optional[str] = None
    currentRole: Optional[str] = None
    yearsExperience: Optional[str] = None
    education: Optional[str] = None
    skills: List[str] = []
    interests: Optional[str] = None
    achievements: Optional[str] = None
    careerGoals: Optional[str] = None

class CareerIdentity(BaseModel):
    statement: Optional[str] = None
    generatedAt: Optional[datetime] = None

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    email: str
    profile: UserProfile = UserProfile()
    careerIdentity: CareerIdentity = CareerIdentity()
    savedCareers: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Career Models
class Career(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str
    category: str
    description: str
    skills: List[str]
    averageSalary: str
    growthRate: str
    education: str
    relatedCareers: List[str] = []
    jobPostings: int
    companies: List[str]
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Request/Response Models
class IdentityGenerationRequest(BaseModel):
    currentRole: str
    yearsExperience: str
    education: str
    selectedSkills: List[str]
    interests: str
    achievements: str
    careerGoals: str

class IdentityGenerationResponse(BaseModel):
    success: bool
    statement: str
    message: Optional[str] = None

class ResumeOptimizationRequest(BaseModel):
    jobTitle: str
    company: str
    jobDescription: str
    currentResume: Optional[str] = None

class ResumeOptimizationResponse(BaseModel):
    success: bool
    optimizedContent: str
    suggestions: List[str] = []
    message: Optional[str] = None

class CoverLetterRequest(BaseModel):
    jobTitle: str
    company: str
    jobDescription: str
    userProfile: Optional[Dict[str, Any]] = None

class CoverLetterResponse(BaseModel):
    success: bool
    coverLetter: str
    message: Optional[str] = None

class CareerRecommendationRequest(BaseModel):
    userProfile: UserProfile
    preferences: Optional[Dict[str, Any]] = None

class CareerRecommendationResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    matchScores: Dict[str, float]
    message: Optional[str] = None