import os
import asyncio
from typing import List, Dict, Any, Optional
import logging
from emergentintegrations import EmergentIntegrations

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.emergent_key = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-c0e1a9a7d2f11A12b4')
        self.ai_client = EmergentIntegrations(api_key=self.emergent_key)
    
    async def generate_career_identity(self, user_data: Dict[str, Any]) -> str:
        """Generate a personalized career identity statement using AI"""
        try:
            prompt = f"""
            Create a professional Career Identity Statement for someone with the following background:
            
            Current Role: {user_data.get('currentRole', 'Professional')}
            Experience Level: {user_data.get('yearsExperience', 'Entry level')}
            Education: {user_data.get('education', 'College graduate')}
            Key Skills: {', '.join(user_data.get('selectedSkills', []))}
            Interests: {user_data.get('interests', 'Professional growth')}
            Achievements: {user_data.get('achievements', 'Various accomplishments')}
            Career Goals: {user_data.get('careerGoals', 'Career advancement')}
            
            Generate a compelling 2-3 sentence Career Identity Statement that:
            1. Highlights their unique value proposition
            2. Emphasizes transferable skills
            3. Connects their background to future opportunities
            4. Is suitable for resumes and professional profiles
            5. Sounds professional and confident
            
            Keep it concise but impactful, focusing on what makes them valuable to employers.
            """
            
            response = await self.ai_client.chat_completion_async(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional career counselor and resume writer. Create compelling career identity statements that help job seekers stand out."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating career identity: {str(e)}")
            return self._fallback_career_identity(user_data)
    
    async def optimize_resume(self, job_info: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize resume content for a specific job using AI"""
        try:
            prompt = f"""
            Analyze this job posting and provide resume optimization suggestions:
            
            Job Title: {job_info.get('jobTitle', 'Professional Role')}
            Company: {job_info.get('company', 'Target Company')}
            Job Description: {job_info.get('jobDescription', 'Professional role with growth opportunities')}
            
            Current Resume: {job_info.get('currentResume', 'No current resume provided')}
            
            Provide specific, actionable resume optimization advice including:
            1. Key skills to highlight based on the job requirements
            2. How to tailor the professional summary
            3. Important keywords to include for ATS systems
            4. Achievement metrics to emphasize
            5. Specific improvements for better job match
            
            Format as a structured improvement guide with clear sections.
            """
            
            response = await self.ai_client.chat_completion_async(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert resume writer and ATS optimization specialist. Provide specific, actionable advice for resume improvement."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.6
            )
            
            optimization_content = response.choices[0].message.content.strip()
            
            # Extract key suggestions
            suggestions = [
                "Quantify achievements with specific metrics",
                "Include relevant keywords from job description",
                "Tailor professional summary to target role",
                "Highlight transferable skills",
                "Use strong action verbs"
            ]
            
            return {
                "optimizedContent": optimization_content,
                "suggestions": suggestions
            }
            
        except Exception as e:
            logger.error(f"Error optimizing resume: {str(e)}")
            return self._fallback_resume_optimization(job_info)
    
    async def generate_cover_letter(self, job_info: Dict[str, Any], user_profile: Optional[Dict[str, Any]] = None) -> str:
        """Generate a personalized cover letter using AI"""
        try:
            user_context = ""
            if user_profile:
                user_context = f"""
                User Background:
                - Current Role: {user_profile.get('currentRole', 'Professional')}
                - Experience: {user_profile.get('yearsExperience', 'Experienced')}
                - Skills: {', '.join(user_profile.get('skills', []))}
                - Career Goals: {user_profile.get('careerGoals', 'Professional growth')}
                """
            
            prompt = f"""
            Write a professional cover letter for this job application:
            
            Job Title: {job_info.get('jobTitle', 'Professional Role')}
            Company: {job_info.get('company', 'Target Company')}
            Job Description: {job_info.get('jobDescription', 'Professional opportunity')}
            
            {user_context}
            
            Create a compelling cover letter that:
            1. Shows genuine interest in the role and company
            2. Highlights relevant qualifications and experience
            3. Demonstrates knowledge of the company/industry
            4. Includes specific examples of achievements
            5. Has a strong closing with call to action
            6. Is professional yet personable
            7. Is 3-4 paragraphs long
            
            Format as a complete cover letter with proper structure.
            """
            
            response = await self.ai_client.chat_completion_async(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional career counselor specializing in cover letter writing. Create compelling, personalized cover letters that help candidates stand out."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating cover letter: {str(e)}")
            return self._fallback_cover_letter(job_info)
    
    async def analyze_career_match(self, user_profile: Dict[str, Any], career: Dict[str, Any]) -> float:
        """Calculate career match score using AI analysis"""
        try:
            prompt = f"""
            Analyze how well this user profile matches this career opportunity:
            
            User Profile:
            - Current Role: {user_profile.get('currentRole', 'Professional')}
            - Skills: {', '.join(user_profile.get('skills', []))}
            - Experience: {user_profile.get('yearsExperience', 'Some experience')}
            - Interests: {user_profile.get('interests', 'Professional growth')}
            - Goals: {user_profile.get('careerGoals', 'Career advancement')}
            
            Career Opportunity:
            - Title: {career.get('title', 'Professional Role')}
            - Required Skills: {', '.join(career.get('skills', []))}
            - Description: {career.get('description', 'Professional opportunity')}
            - Category: {career.get('category', 'Professional')}
            
            Provide a match score from 0-100 based on:
            1. Skills alignment (40%)
            2. Experience relevance (30%)
            3. Interest compatibility (20%)
            4. Career progression fit (10%)
            
            Return only the numeric score (0-100).
            """
            
            response = await self.ai_client.chat_completion_async(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a career matching specialist. Analyze user-career compatibility and provide numeric match scores."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            # Extract numeric score
            import re
            score_match = re.search(r'\d+', score_text)
            if score_match:
                score = min(100, max(0, int(score_match.group())))
                return float(score)
            else:
                return 75.0  # Default moderate match
                
        except Exception as e:
            logger.error(f"Error analyzing career match: {str(e)}")
            return 70.0  # Default fallback score
    
    def _fallback_career_identity(self, user_data: Dict[str, Any]) -> str:
        """Fallback career identity when AI is unavailable"""
        role = user_data.get('currentRole', 'professional')
        skills = user_data.get('selectedSkills', ['problem-solving', 'communication'])
        experience = user_data.get('yearsExperience', 'experienced')
        
        return f"As a {experience} {role}, I bring a unique combination of {', '.join(skills[:3])} to drive meaningful impact. My proven track record and commitment to continuous learning position me to excel in challenging roles that require collaboration and innovation."
    
    def _fallback_resume_optimization(self, job_info: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback resume optimization when AI is unavailable"""
        job_title = job_info.get('jobTitle', 'target role')
        
        return {
            "optimizedContent": f"""**RESUME OPTIMIZATION SUGGESTIONS**

**Professional Summary Enhancement:**
Tailor your professional summary to emphasize skills relevant to the {job_title} position. Focus on quantifiable achievements and results that demonstrate your value proposition.

**Key Improvements:**
• Quantify achievements with specific metrics and percentages
• Include relevant keywords from the job description for ATS optimization
• Strengthen action verbs to show initiative and leadership
• Highlight transferable skills that apply to the target role
• Emphasize recent and relevant experience

**Skills to Highlight:**
• Technical expertise relevant to {job_title}
• Leadership and project management capabilities
• Problem-solving and analytical thinking
• Communication and collaboration skills""",
            "suggestions": [
                "Quantify achievements with specific numbers",
                "Use keywords from job description",
                "Strengthen action verbs",
                "Highlight relevant skills",
                "Show career progression"
            ]
        }
    
    def _fallback_cover_letter(self, job_info: Dict[str, Any]) -> str:
        """Fallback cover letter when AI is unavailable"""
        job_title = job_info.get('jobTitle', 'this position')
        company = job_info.get('company', 'your organization')
        
        return f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company}. With my background in professional development and proven track record of success, I am excited about the opportunity to contribute to your team's continued growth.

In my previous roles, I have successfully delivered results through strategic thinking and collaborative leadership. My experience has equipped me with the skills necessary to excel in this position, particularly in problem-solving, project management, and stakeholder communication.

I am particularly drawn to {company} because of your commitment to innovation and excellence in your industry. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's objectives and help drive your organization's success.

Thank you for considering my application. I look forward to hearing from you and discussing how I can contribute to your team.

Sincerely,
[Your Name]"""