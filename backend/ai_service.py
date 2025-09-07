import os
import asyncio
from typing import List, Dict, Any, Optional
import logging
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.emergent_key = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-c0e1a9a7d2f11A12b4')

    def _get_chat_client(self, system_message: str) -> LlmChat:
        return LlmChat(
            api_key=self.emergent_key,
            session_id="career_ai_session",
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")

    async def generate_career_identity(self, user_data: Dict[str, Any]) -> str:
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

            Keep it concise but impactful.
            """

            chat_client = self._get_chat_client("You are a professional career counselor and resume writer. Create compelling career identity statements.")
            response = await chat_client.send_message(UserMessage(text=prompt))
            return response.strip()
        except Exception as e:
            logger.error(f"Error generating career identity: {str(e)}")
            return self._fallback_career_identity(user_data)

    async def optimize_resume(self, job_info: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize resume content. Accepts either 'currentResume' string or structured 'jobs'. Returns guide, jobEdits, proTips."""
        try:
            job_title = job_info.get('jobTitle', 'Professional Role')
            company = job_info.get('company', 'Target Company')
            jd = job_info.get('jobDescription', '')
            resume_text = job_info.get('currentResume')
            jobs = job_info.get('jobs')

            if jobs and isinstance(jobs, list):
                resume_section = json.dumps(jobs, ensure_ascii=False)
                resume_desc = "Structured jobs (JSON)"
            else:
                resume_section = (resume_text or "").strip()
                resume_desc = "Plain text resume"

            prompt = f"""
            You are an expert resume writer and ATS optimization specialist.

            TASK: Based on the target role, analyze the user's resume and return STRICT JSON with keys:
            - optimizedGuide: short, actionable guide to tailor the resume to the job
            - jobEdits: array; each item has: jobIndex, jobInfo{{company, role, period}}, bulletEdits[{{original, improved, rationale, keywords[]}}]
            - proTips: array of 5-8 resume-specific, high-impact tips derived from the user's actual bullets and gaps vs JD

            TARGET ROLE: {job_title} at {company}
            JOB DESCRIPTION: {jd}
            RESUME INPUT TYPE: {resume_desc}
            RESUME INPUT:
            {resume_section}

            RULES:
            - Treat each non-empty bullet/line as a candidate for improvement (max 10 per job)
            - Improve with quantified impact, strong verbs, and JD keywords
            - Return STRICT JSON only. No extra commentary. No markdown fences.
            """

            chat_client = self._get_chat_client("You write structured resume improvements and return strict JSON when asked.")
            response = await chat_client.send_message(UserMessage(text=prompt))
            text = response.strip()

            optimized_guide = ""
            job_edits: List[Dict[str, Any]] = []
            pro_tips: List[str] = []
            flat_bullets: List[Dict[str, Any]] = []

            try:
                data = json.loads(text)
                optimized_guide = data.get("optimizedGuide", "")
                job_edits = data.get("jobEdits", [])
                pro_tips = data.get("proTips", [])
                # Build flat list for backward compatibility
                for j in job_edits:
                    for b in j.get("bulletEdits", []):
                        flat_bullets.append(b)
            except Exception as parse_err:
                logger.warning(f"JSON parse failed, using raw text as guide. Error: {parse_err}")
                optimized_guide = text
                job_edits = []
                pro_tips = []

            # Suggestions derived from job edits or fallback
            suggestions: List[str] = []
            for j in job_edits:
                for be in j.get("bulletEdits", [])[:3]:
                    if be.get("rationale"):
                        suggestions.append(be["rationale"][:180])
            if not suggestions:
                suggestions = [
                    "Quantify achievements with specific metrics",
                    "Mirror critical keywords from the job description",
                    "Lead bullets with strong, varied action verbs",
                    "Prioritize most relevant experience for the target role",
                    "Emphasize outcomes and stakeholder impact"
                ]

            return {
                "optimizedGuide": optimized_guide,
                "optimizedContent": optimized_guide,  # backward compat
                "suggestions": suggestions,
                "jobEdits": job_edits,
                "bulletEdits": flat_bullets,
                "proTips": pro_tips,
            }
        except Exception as e:
            logger.error(f"Error optimizing resume: {str(e)}")
            return self._fallback_resume_optimization(job_info)

    async def rewrite_bullet(self, job_info: Dict[str, Any], original: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            job_title = job_info.get('jobTitle', 'Professional Role')
            company = job_info.get('company', 'Target Company')
            jd = job_info.get('jobDescription', '')
            ctx = context or {}

            prompt = f"""
            Improve a single resume bullet for the target role.

            TARGET ROLE: {job_title} at {company}
            JOB DESCRIPTION: {jd}
            JOB CONTEXT: company={ctx.get('company','')}, role={ctx.get('role','')}, period={ctx.get('period','')}

            ORIGINAL BULLET: {original}

            Return STRICT JSON with keys: improved (string), rationale (string), keywords (array of strings).
            No extra commentary.
            """
            chat_client = self._get_chat_client("You provide precise bullet rewrites with rationale and keywords, JSON only.")
            text = (await chat_client.send_message(UserMessage(text=prompt))).strip()
            try:
                data = json.loads(text)
                return {
                    "improved": data.get("improved", ""),
                    "rationale": data.get("rationale", ""),
                    "keywords": data.get("keywords", []),
                }
            except Exception:
                # Heuristic fallback
                return {
                    "improved": original.replace("responsible for", "led").replace("helped", "drove"),
                    "rationale": "Strengthened verbs and focused on ownership to increase impact.",
                    "keywords": [],
                }
        except Exception as e:
            logger.error(f"Error rewriting bullet: {str(e)}")
            return {
                "improved": original,
                "rationale": "",
                "keywords": [],
            }

    async def generate_cover_letter(self, job_info: Dict[str, Any], user_profile: Optional[Dict[str, Any]] = None) -> str:
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

            chat_client = self._get_chat_client("You are a professional career counselor specializing in cover letter writing.")
            response = await chat_client.send_message(UserMessage(text=prompt))
            return response.strip()
        except Exception as e:
            logger.error(f"Error generating cover letter: {str(e)}")
            return self._fallback_cover_letter(job_info)

    async def analyze_career_match(self, user_profile: Dict[str, Any], career: Dict[str, Any]) -> float:
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

            Provide a match score 0-100. Return only the number.
            """
            chat_client = self._get_chat_client("You are a career matching specialist.")
            response = await chat_client.send_message(UserMessage(text=prompt))
            import re
            score_match = re.search(r"\d+", response.strip())
            if score_match:
                score = min(100, max(0, int(score_match.group())))
                return float(score)
            return 75.0
        except Exception:
            return 70.0

    def _fallback_career_identity(self, user_data: Dict[str, Any]) -> str:
        role = user_data.get('currentRole', 'professional')
        skills = user_data.get('selectedSkills', ['problem-solving', 'communication'])
        experience = user_data.get('yearsExperience', 'experienced')
        return f"As a {experience} {role}, I bring a unique combination of {', '.join(skills[:3])} to drive meaningful impact. My proven track record and commitment to continuous learning position me to excel in challenging roles that require collaboration and innovation."

    def _fallback_resume_optimization(self, job_info: Dict[str, Any]) -> Dict[str, Any]:
        job_title = job_info.get('jobTitle', 'target role')
        return {
            "optimizedGuide": f"Focus your resume on outcomes, quantify impact, and mirror key {job_title} keywords.",
            "optimizedContent": f"Focus your resume on outcomes, quantify impact, and mirror key {job_title} keywords.",
            "suggestions": [
                "Quantify achievements with specific numbers",
                "Use keywords from job description",
                "Strengthen action verbs",
                "Highlight relevant skills",
                "Show career progression"
            ],
            "jobEdits": [],
            "bulletEdits": [],
            "proTips": [
                "Lead bullets with impact-first phrasing",
                "Consolidate older roles; expand recent achievements",
                "Align skills section to JD",
            ]
        }

    def _fallback_cover_letter(self, job_info: Dict[str, Any]) -> str:
        job_title = job_info.get('jobTitle', 'this position')
        company = job_info.get('company', 'your organization')
        return f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company}. With my background in professional development and proven track record of success, I am excited about the opportunity to contribute to your team's continued growth.

In my previous roles, I have successfully delivered results through strategic thinking and collaborative leadership. My experience has equipped me with the skills necessary to excel in this position, particularly in problem-solving, project management, and stakeholder communication.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Sincerely,
[Your Name]"""