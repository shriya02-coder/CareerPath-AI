# CareerPath AI Lite - Backend Integration Contracts

## API Contracts

### Authentication & User Management
```
POST /api/auth/register - Register new user
POST /api/auth/login - User login
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
```

### Career Identity Management
```
POST /api/identity/generate - Generate career identity statement using AI
GET /api/identity/:userId - Get user's career identity
PUT /api/identity/:userId - Update career identity
```

### Career Data & Recommendations
```
GET /api/careers - Get all careers with search/filter
GET /api/careers/:id - Get specific career details
POST /api/careers/recommend - Get AI-powered career recommendations based on user profile
GET /api/careers/categories - Get career categories
```

### Resume & Cover Letter Assistant
```
POST /api/resume/optimize - AI-powered resume optimization
POST /api/resume/cover-letter - Generate cover letter using AI
POST /api/resume/analyze - Analyze resume against job description
```

### User Progress & Analytics
```
GET /api/user/progress - Get user's career exploration progress
POST /api/user/save-career - Save career to user's favorites
DELETE /api/user/save-career/:careerId - Remove from favorites
```

## Data Migration from Mock.js

### Current Mock Data to Replace:
1. **careers array** → MongoDB careers collection
2. **careerCategories** → Static data or separate collection
3. **skills array** → MongoDB skills collection
4. **experiences/educationLevels** → Static enums
5. **sampleIdentityStatements** → Will be AI-generated

### Frontend Integration Points:

#### 1. Identity Builder (IdentityBuilder.jsx)
- **Replace**: `generateIdentityStatement()` mock function
- **With**: API call to `/api/identity/generate` using Emergent LLM
- **Data Flow**: Form data → Backend AI processing → Return generated statement

#### 2. Career Explorer (CareerExplorer.jsx) 
- **Replace**: `careers` import from mock.js
- **With**: API calls to `/api/careers` with search/filter params
- **Data Flow**: Search/filter params → Backend query → Return filtered careers

#### 3. Career Detail (CareerDetail.jsx)
- **Replace**: `careers.find()` from mock data
- **With**: API call to `/api/careers/:id`
- **Add**: AI-powered career match scoring

#### 4. Resume Assistant (ResumeAssistant.jsx)
- **Replace**: Mock generation functions
- **With**: API calls to `/api/resume/optimize` and `/api/resume/cover-letter`
- **Data Flow**: Job info + resume → AI processing → Optimized content

## Backend Implementation Plan

### 1. Database Models (MongoDB)
```javascript
// User Model
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  profile: {
    name: String,
    currentRole: String,
    yearsExperience: String,
    education: String,
    skills: [String],
    interests: String,
    achievements: String,
    careerGoals: String
  },
  careerIdentity: {
    statement: String,
    generatedAt: Date
  },
  savedCareers: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}

// Career Model
{
  _id: ObjectId,
  title: String,
  category: String,
  description: String,
  skills: [String],
  averageSalary: String,
  growthRate: String,
  education: String,
  relatedCareers: [ObjectId],
  jobPostings: Number,
  companies: [String],
  createdAt: Date
}

// UserSession Model (for progress tracking)
{
  _id: ObjectId,
  userId: ObjectId,
  sessionData: Object,
  lastActivity: Date
}
```

### 2. AI Integration with Emergent LLM Key
- **Career Identity Generation**: Analyze user input and generate personalized statements
- **Resume Optimization**: Compare resume with job descriptions and suggest improvements
- **Cover Letter Generation**: Create tailored cover letters based on job and user profile
- **Career Matching**: AI-powered scoring of career fit based on user profile

### 3. API Endpoints Implementation Priority
1. **High Priority**: Identity generation, Career data, Resume assistance
2. **Medium Priority**: User authentication, Career recommendations
3. **Low Priority**: Analytics, Advanced filtering

### 4. Frontend Integration Steps
1. Create API service layer (`src/services/api.js`)
2. Replace mock data imports with API calls
3. Add loading states and error handling
4. Implement user authentication flow
5. Add real-time AI processing indicators

### 5. Error Handling & Validation
- Input validation for all AI-related endpoints
- Rate limiting for AI API calls
- Fallback responses when AI services are unavailable
- User-friendly error messages

## Testing Strategy
- Unit tests for AI integration functions
- Integration tests for API endpoints
- Frontend testing for AI response handling
- Load testing for AI endpoints

## Deployment Considerations
- Environment variables for Emergent LLM Key
- AI response caching for performance
- Database indexing for career search
- Error monitoring for AI failures