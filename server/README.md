# Backend Server - MVP

Complete backend API for AI Career Agent job automation platform.

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.ts              # User schema
│   │   ├── Resume.ts            # Resume storage
│   │   ├── Job.ts               # Job listings
│   │   └── Application.ts       # Job applications tracking
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   └── errorHandler.ts      # Global error handling
│   │
│   ├── integrations/            # PHASE 2: Portal scrapers
│   │   └── index.ts             # (Playwright integration)
│   │
│   ├── prompts/                 # PHASE 2: AI prompt templates
│   │   └── index.ts             # (Resume tailor, cover letter, etc.)
│   │
│   ├── utils/
│   │   ├── jwt.ts               # Token generation & verification
│   │   └── errors.ts            # Custom error classes
│   │
│   ├── services.ts              # Business logic
│   │   ├── AuthService
│   │   ├── ResumeService
│   │   ├── JobService
│   │   └── ApplicationService
│   │
│   ├── controllers.ts           # Request handlers
│   ├── routes.ts                # API endpoints
│   ├── app.ts                   # Express setup
│   └── server.ts                # Server startup
│
├── .env                         # Environment variables
├── .env.example                 # Example config
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Auth
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile (requires auth)

### Resume
- `POST /api/v1/resume/upload` - Upload resume
- `GET /api/v1/resume` - Get all user resumes
- `DELETE /api/v1/resume/:resumeId` - Delete resume

### Jobs
- `GET /api/v1/jobs/search` - Search jobs (with filters)
- `GET /api/v1/jobs/:jobId` - Get job details

### Applications
- `POST /api/v1/applications/apply` - Apply to a job
- `GET /api/v1/applications` - Get all user applications
- `PUT /api/v1/applications/:applicationId/status` - Update application status
- `GET /api/v1/applications/stats` - Get application statistics

## 🔐 Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Get access token from signup/login response.

## 📚 Services

### AuthService
- `signup(email, password, name)` - Create new user
- `login(email, password)` - User login
- `refreshTokens(refreshToken)` - Get new tokens
- `getUser(userId)` - Get user details

### ResumeService
- `uploadResume(userId, fileName, filePath, fileSize)`
- `getUserResumes(userId)`
- `getResume(userId, resumeId)`
- `deleteResume(userId, resumeId)`

### JobService
- `searchJobs(filters)` - Search with pagination
- `getJob(jobId)` - Get job details
- `createJob(jobData)` - Create job record

### ApplicationService
- `applyToJob(userId, jobId, sourcePortal, ...)`
- `getUserApplications(userId, filters)`
- `updateApplicationStatus(userId, appId, status)`
- `getApplicationStats(userId)`

## 🔄 PHASE 2 Features (TODO)

These are marked in the code with `TODO: PHASE 2` comments:

1. **Integrations** (`src/integrations/`)
   - Indeed scraper
   - LinkedIn scraper
   - Glassdoor scraper
   - AngelList API integration

2. **Prompts** (`src/prompts/`)
   - Resume tailoring
   - Cover letter generation
   - Job matching scoring
   - Interview prep

3. **Services**
   - Resume text extraction (PDF/DOC)
   - Resume AI analysis
   - Job scraping automation
   - Auto-apply functionality
   - Status tracking

4. **Infrastructure**
   - Bull job queue
   - Redis caching
   - Email notifications
   - Webhook system
   - Analytics tracking

## 🧪 Testing

```bash
npm test
```

## 📦 Build

```bash
npm run build
npm start
```

Builds to `dist/` folder.

## 🔗 Frontend Connection

Frontend connects to:
```
VITE_API_URL=http://localhost:5000/api/v1
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- All errors return `{ success: false, message: "..." }`
- All success responses return `{ success: true, data: ... }`
- MongoDB connection string is in `.env` (already configured)

## 🆘 Troubleshooting

**MongoDB Connection Error:**
- Ensure `.env` has correct `MONGODB_URI`
- Check IP is whitelisted in MongoDB Atlas
- Verify network connectivity

**Port Already in Use:**
```bash
# Change PORT in .env
PORT=5001
```

**Module Not Found:**
```bash
rm -rf node_modules
npm install
```

---

**Next Steps:** Once backend is running, connect frontend at `http://localhost:5173` to start testing the full application flow!
