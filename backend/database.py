from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional
import os
import logging
from bson import ObjectId
from datetime import datetime

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL')
        self.client = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.mongo_url)
            self.db = self.client[os.environ.get('DB_NAME', 'careerpath_ai')]
            # Test connection
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
            
            # Initialize collections with sample data if empty
            await self._initialize_data()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    async def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
    
    async def _initialize_data(self):
        """Initialize database with sample career data"""
        careers_count = await self.db.careers.count_documents({})
        if careers_count == 0:
            sample_careers = [
                {
                    "title": "UX/UI Designer",
                    "category": "Design & Creative",
                    "description": "Create intuitive and engaging user experiences for digital products",
                    "skills": ["Design Thinking", "Prototyping", "User Research", "Figma", "Adobe Creative Suite"],
                    "averageSalary": "$75,000 - $120,000",
                    "growthRate": "13% (Much faster than average)",
                    "education": "Bachelor's degree in Design, Psychology, or related field",
                    "relatedCareers": [],
                    "jobPostings": 1250,
                    "companies": ["Google", "Apple", "Airbnb", "Spotify", "Netflix"],
                    "createdAt": datetime.utcnow()
                },
                {
                    "title": "Frontend Developer",
                    "category": "Technology",
                    "description": "Build user-facing web applications using modern frameworks and technologies",
                    "skills": ["JavaScript", "React", "HTML/CSS", "TypeScript", "Version Control"],
                    "averageSalary": "$70,000 - $130,000",
                    "growthRate": "22% (Much faster than average)",
                    "education": "Bachelor's degree in Computer Science or equivalent experience",
                    "relatedCareers": [],
                    "jobPostings": 2100,
                    "companies": ["Meta", "Amazon", "Microsoft", "Tesla", "Shopify"],
                    "createdAt": datetime.utcnow()
                },
                {
                    "title": "Product Manager",
                    "category": "Business & Strategy",
                    "description": "Drive product strategy and coordinate cross-functional teams to deliver successful products",
                    "skills": ["Product Strategy", "Data Analysis", "Leadership", "Market Research", "Agile Methodology"],
                    "averageSalary": "$90,000 - $160,000",
                    "growthRate": "19% (Much faster than average)",
                    "education": "Bachelor's degree in Business, Engineering, or related field",
                    "relatedCareers": [],
                    "jobPostings": 980,
                    "companies": ["Google", "Uber", "Slack", "Zoom", "Dropbox"],
                    "createdAt": datetime.utcnow()
                },
                {
                    "title": "Data Scientist",
                    "category": "Technology",
                    "description": "Analyze complex data to help organizations make data-driven decisions",
                    "skills": ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
                    "averageSalary": "$95,000 - $165,000",
                    "growthRate": "35% (Much faster than average)",
                    "education": "Master's degree in Data Science, Statistics, or related field",
                    "relatedCareers": [],
                    "jobPostings": 1580,
                    "companies": ["Netflix", "Spotify", "Airbnb", "LinkedIn", "Twitter"],
                    "createdAt": datetime.utcnow()
                },
                {
                    "title": "Digital Marketing Manager",
                    "category": "Marketing & Communications",
                    "description": "Develop and execute digital marketing strategies across multiple channels",
                    "skills": ["SEO/SEM", "Social Media Marketing", "Content Strategy", "Analytics", "Email Marketing"],
                    "averageSalary": "$55,000 - $95,000",
                    "growthRate": "10% (Faster than average)",
                    "education": "Bachelor's degree in Marketing, Communications, or related field",
                    "relatedCareers": [],
                    "jobPostings": 1890,
                    "companies": ["HubSpot", "Mailchimp", "Buffer", "Hootsuite", "Canva"],
                    "createdAt": datetime.utcnow()
                },
                {
                    "title": "Cybersecurity Analyst",
                    "category": "Technology",
                    "description": "Protect organizations from cyber threats and maintain information security",
                    "skills": ["Network Security", "Incident Response", "Risk Assessment", "Compliance", "Ethical Hacking"],
                    "averageSalary": "$80,000 - $140,000",
                    "growthRate": "33% (Much faster than average)",
                    "education": "Bachelor's degree in Cybersecurity, Computer Science, or related field",
                    "relatedCareers": [],
                    "jobPostings": 1650,
                    "companies": ["IBM", "Cisco", "FireEye", "CrowdStrike", "Palo Alto Networks"],
                    "createdAt": datetime.utcnow()
                }
            ]
            
            await self.db.careers.insert_many(sample_careers)
            logger.info("Initialized careers collection with sample data")
    
    # Career Methods
    async def get_careers(self, search: str = None, category: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get careers with optional search and filtering"""
        query = {}
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"skills": {"$regex": search, "$options": "i"}}
            ]
        
        if category:
            query["category"] = category
        
        cursor = self.db.careers.find(query).limit(limit)
        careers = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string and clean up the data
        for career in careers:
            career["id"] = str(career.pop("_id"))
            # Remove any None values and ensure all fields are properly serializable
            career = {k: v for k, v in career.items() if v is not None}
        
        return careers
    
    async def get_career_by_id(self, career_id: str) -> Optional[Dict[str, Any]]:
        """Get specific career by ID"""
        try:
            career = await self.db.careers.find_one({"_id": ObjectId(career_id)})
            if career:
                career["id"] = str(career.pop("_id"))
                # Remove any None values and ensure all fields are properly serializable
                career = {k: v for k, v in career.items() if v is not None}
            return career
        except Exception as e:
            logger.error(f"Error getting career by ID: {str(e)}")
            return None
    
    async def get_career_categories(self) -> List[str]:
        """Get distinct career categories"""
        categories = await self.db.careers.distinct("category")
        return categories
    
    # User Methods
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create new user"""
        user_data["createdAt"] = datetime.utcnow()
        user_data["updatedAt"] = datetime.utcnow()
        
        result = await self.db.users.insert_one(user_data)
        return str(result.inserted_id)
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        user = await self.db.users.find_one({"email": email})
        if user:
            user["id"] = str(user["_id"])
        return user
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            user = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                user["id"] = str(user["_id"])
            return user
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        try:
            update_data["updatedAt"] = datetime.utcnow()
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return False
    
    async def save_career_identity(self, user_id: str, identity_statement: str) -> bool:
        """Save career identity statement for user"""
        try:
            identity_data = {
                "careerIdentity.statement": identity_statement,
                "careerIdentity.generatedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": identity_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error saving career identity: {str(e)}")
            return False
    
    async def save_user_career(self, user_id: str, career_id: str) -> bool:
        """Save career to user's favorites"""
        try:
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {"savedCareers": career_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error saving user career: {str(e)}")
            return False
    
    async def remove_user_career(self, user_id: str, career_id: str) -> bool:
        """Remove career from user's favorites"""
        try:
            result = await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {"savedCareers": career_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error removing user career: {str(e)}")
            return False