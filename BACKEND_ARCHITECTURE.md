# Backend Architecture & Implementation Plan
**Node.js + Express + MongoDB SaaS**

---

## 1. Tech Stack Rationale

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js 20+ LTS | High concurrency, JavaScript everywhere, NPM ecosystem |
| **Framework** | Express.js | Minimal, flexible, industry standard middleware pattern |
| **Database** | MongoDB + Mongoose | Flexible schema, horizontal scaling, JSON documents |
| **Job Queue** | Bull (Redis backend) | Reliable job scheduling, distributed workers, retries |
| **API Documentation** | Swagger/OpenAPI | Auto-generated docs, client SDK generation |
| **Authentication** | JWT + Refresh tokens | Stateless, scalable, secure |
| **Caching** | Redis | Fast reads, session management, rate limiting |
| **Logging** | Winston + Elasticsearch | Structured logs, centralized search, debugging |
| **Error Tracking** | Sentry | Real-time error monitoring, alerts |
| **Testing** | Jest + Supertest | Unit tests, API tests, coverage reports |
| **Deployment** | Docker + Docker Compose | Containerization, local dev, production parity |
| **Process Manager** | PM2 | Zero-downtime restarts, auto-restart, monitoring |
| **API Client for AI** | OpenAI/Gemini SDK | Seamless AI integration |

---

## 2. Project Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts (MongoDB connection)
│   │   ├── redis.ts (Redis client)
│   │   ├── env.ts (Environment variables)
│   │   └── logger.ts (Winston setup)
│   │
│   ├── middleware/
│   │   ├── auth.ts (JWT verification)
│   │   ├── errorHandler.ts (Global error handler)
│   │   ├── requestLogger.ts (Request/response logging)
│   │   ├── rateLimiter.ts (Rate limiting)
│   │   ├── validation.ts (Request validation)
│   │   └── cors.ts (CORS configuration)
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── jobController.ts
│   │   ├── applicationController.ts
│   │   ├── resumeController.ts
│   │   ├── aiController.ts
│   │   ├── automationController.ts
│   │   ├── analyticsController.ts
│   │   └── userController.ts
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── authService.ts
│   │   │   ├── tokenService.ts
│   │   │   └── passwordService.ts
│   │   ├── jobs/
│   │   │   ├── jobService.ts
│   │   │   ├── jobScraper.ts (Playwright integration)
│   │   │   ├── jobFilter.ts
│   │   │   └── jobCache.ts
│   │   ├── applications/
│   │   │   ├── applicationService.ts
│   │   │   ├── automationService.ts
│   │   │   └── applicationTracker.ts
│   │   ├── resume/
│   │   │   ├── resumeService.ts
│   │   │   ├── resumeParser.ts (Extract text/data)
│   │   │   └── resumeStorage.ts (S3)
│   │   ├── ai/
│   │   │   ├── aiService.ts (OpenAI/Gemini wrapper)
│   │   │   ├── resumeTailor.ts
│   │   │   ├── coverLetterGenerator.ts
│   │   │   ├── jobMatcher.ts (AI scoring)
│   │   │   └── interviewPrepService.ts
│   │   ├── automation/
│   │   │   ├── automationEngine.ts (Job queue orchestrator)
│   │   │   ├── playwrightWorker.ts (Automation scripts)
│   │   │   ├── browserPool.ts (Browser instance management)
│   │   │   └── stealth.ts (Anti-detection techniques)
│   │   ├── analytics/
│   │   │   ├── analyticsService.ts
│   │   │   └── eventTracker.ts (Track user actions)
│   │   ├── notification/
│   │   │   ├── emailService.ts (SendGrid/Nodemailer)
│   │   │   └── webhookService.ts
│   │   └── payment/
│   │       ├── stripeService.ts
│   │       └── subscriptionService.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Resume.ts
│   │   ├── Job.ts
│   │   ├── Application.ts
│   │   ├── AutomationLog.ts
│   │   ├── AiAnalysis.ts
│   │   └── Subscription.ts
│   │
│   ├── routes/
│   │   ├── index.ts (All routes)
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   ├── applications.ts
│   │   ├── resume.ts
│   │   ├── ai.ts
│   │   ├── automation.ts
│   │   ├── analytics.ts
│   │   └── admin.ts
│   │
│   ├── jobs/
│   │   ├── applicationApprovalQueue.ts
│   │   ├── automationQueue.ts
│   │   ├── notificationQueue.ts
│   │   ├── analyticsQueue.ts
│   │   └── workers.ts (Process jobs)
│   │
│   ├── utils/
│   │   ├── validators.ts (Schema validation)
│   │   ├── errorHandler.ts
│   │   ├── jwt.ts (Token generation)
│   │   ├── password.ts (Hashing)
│   │   ├── helpers.ts
│   │   └── constants.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── express.ts (Extend Express types)
│   │   ├── api.ts (Request/Response types)
│   │   └── models.ts
│   │
│   ├── seeds/ (Demo data)
│   │   ├── seedDatabase.ts
│   │   └── demoJobs.ts
│   │
│   └── app.ts (Express app setup)
│
├── tests/
│   ├── unit/
│   │   ├── services.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── jobs.test.ts
│   │   └── applications.test.ts
│   └── e2e/
│       └── workflows.test.ts
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
│
├── scripts/
│   ├── startWorkers.ts (Start Bull workers)
│   ├── seedDb.ts
│   └── migrate.ts (Database migrations)
│
├── .env.example
├── .env.production
├── .eslintrc.json
├── jest.config.js
├── tsconfig.json
└── package.json
```

---

## 3. Express App Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg) } }));
app.use(requestLogger);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/v1', routes);

// Global error handler
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
```

---

## 4. Service Architecture

### A. Authentication Service

```typescript
// src/services/auth/authService.ts
import { User } from '../../models/User';
import { TokenService } from './tokenService';
import { PasswordService } from './passwordService';

export class AuthService {
  async signup(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    // Hash password
    const hashedPassword = await PasswordService.hash(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });

    // Generate tokens
    const tokens = TokenService.generateTokens(user);

    return { user: user.toJSON(), tokens };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await PasswordService.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const tokens = TokenService.generateTokens(user);

    return { user: user.toJSON(), tokens };
  }

  async refreshToken(refreshToken: string) {
    const payload = TokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user) throw new Error('User not found');

    const newTokens = TokenService.generateTokens(user);
    return { tokens: newTokens };
  }

  async logout(userId: string) {
    // Invalidate refresh token in Redis
    await redis.del(`refreshToken:${userId}`);
  }
}

// src/services/auth/tokenService.ts
export class TokenService {
  static generateTokens(user: IUser) {
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }
}
```

### B. Job Scraping & Caching

```typescript
// src/services/jobs/jobService.ts
import { Job } from '../../models/Job';
import { redis } from '../../config/redis';

export class JobService {
  async searchJobs(filters: JobFilters, page: number = 1) {
    const cacheKey = `jobs:${JSON.stringify(filters)}:${page}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Build query
    let query = Job.find();
    
    if (filters.search) {
      query = query.or([
        { title: { $regex: filters.search, $options: 'i' } },
        { company: { $regex: filters.search, $options: 'i' } },
      ]);
    }
    
    if (filters.minSalary) {
      query = query.where('salary.min').gte(filters.minSalary);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      query = query.where('requirements').in(filters.skills);
    }

    // Pagination
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const [jobs, total] = await Promise.all([
      query
        .skip(skip)
        .limit(limit)
        .sort({ postedDate: -1 })
        .exec(),
      query.countDocuments(),
    ]);

    const result = { jobs, total, page, pages: Math.ceil(total / limit) };
    
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(result));
    
    return result;
  }

  async getJob(jobId: string) {
    const cacheKey = `job:${jobId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');

    await redis.setex(cacheKey, 3600, JSON.stringify(job));
    return job;
  }
}

// src/services/jobs/jobScraper.ts
import { Browser, Page, chromium } from 'playwright';
import { Job } from '../../models/Job';

export class JobScraper {
  private browser: Browser | null = null;

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
    });
  }

  async scrapeIndeed(query: string, location: string): Promise<IJob[]> {
    const page = await this.browser!.newPage();
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
    
    await page.goto(url, { waitUntil: 'networkidle' });

    const jobs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-job-id]')).map(el => ({
        title: el.querySelector('.jobTitle')?.textContent || '',
        company: el.querySelector('[data-testid="company-name"]')?.textContent || '',
        location: el.querySelector('[data-testid="job-location"]')?.textContent || '',
        url: el.querySelector('a')?.href || '',
        salary: extractSalary(el.textContent || ''),
      }));
    });

    // Store in database
    for (const job of jobs) {
      await Job.findOneAndUpdate(
        { sourcePortal: 'indeed', jobUrl: job.url },
        {
          ...job,
          sourcePortal: 'indeed',
          scrapedDate: new Date(),
        },
        { upsert: true }
      );
    }

    await page.close();
    return jobs;
  }

  async close() {
    await this.browser?.close();
  }
}

function extractSalary(text: string) {
  const match = text.match(/\$[\d,]+/g);
  if (!match) return null;
  return {
    min: parseInt(match[0].replace(/\$|,/g, '')),
    max: match[1] ? parseInt(match[1].replace(/\$|,/g, '')) : null,
  };
}
```

### C. AI Integration Service

```typescript
// src/services/ai/aiService.ts
import { OpenAI } from 'openai';
import { cache } from '../../config/redis';

export class AiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async tailorResume(
    resumeText: string,
    jobDescription: string
  ): Promise<string> {
    const cacheKey = `tailored:${hash(resumeText + jobDescription)}`;
    
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer. Tailor the provided resume to match the job description while maintaining truthfulness.',
        },
        {
          role: 'user',
          content: `
            Resume:
            ${resumeText}
            
            Job Description:
            ${jobDescription}
            
            Please tailor the resume to highlight relevant skills and experiences.
            Return only the tailored resume text.
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const tailoredResume = response.choices[0].message.content || '';
    
    // Cache for 24 hours
    await cache.setex(cacheKey, 86400, tailoredResume);
    
    return tailoredResume;
  }

  async generateCoverLetter(
    resume: string,
    jobDescription: string,
    companyName: string
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert cover letter writer. Write compelling, personalized cover letters.',
        },
        {
          role: 'user',
          content: `
            Create a cover letter for:
            Resume: ${resume}
            Job: ${jobDescription}
            Company: ${companyName}
          `,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    return response.choices[0].message.content || '';
  }

  async scoreJobMatch(
    resumeText: string,
    jobDescription: string
  ): Promise<number> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a job matching expert. Score how well a resume matches a job (0-100).',
        },
        {
          role: 'user',
          content: `
            Resume: ${resumeText}
            Job: ${jobDescription}
            
            Return only a number between 0 and 100.
          `,
        },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const scoreText = response.choices[0].message.content || '50';
    return parseInt(scoreText.trim(), 10);
  }
}
```

### D. Automation Engine (Job Queue)

```typescript
// src/jobs/automationQueue.ts
import Queue from 'bull';
import { redis } from '../config/redis';

export const automationQueue = new Queue('automation', {
  redis: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
  },
});

export interface AutomationJobData {
  userId: string;
  portal: 'indeed' | 'glassdoor' | 'linkedin';
  jobIds: string[];
  resumeId: string;
}

// Add job to queue
export async function scheduleAutomation(data: AutomationJobData) {
  await automationQueue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  });
}

// Process jobs
automationQueue.process(10, async (job) => {
  const { userId, portal, jobIds, resumeId } = job.data as AutomationJobData;
  
  console.log(`Processing automation for user ${userId}`);
  
  const automationService = new AutomationService();
  
  try {
    for (const jobId of jobIds) {
      await automationService.applyToJob({
        userId,
        jobId,
        portal,
        resumeId,
      });
      
      // Update job progress
      await job.progress(Math.floor((jobIds.indexOf(jobId) / jobIds.length) * 100));
      
      // Random delay (human-like)
      await new Promise(r => setTimeout(r, Math.random() * 5000 + 3000));
    }
    
    return { success: true, applicationsCount: jobIds.length };
  } catch (error) {
    console.error('Automation error:', error);
    throw error;
  }
});

// Monitor queue
automationQueue.on('completed', (job) => {
  console.log(`Automation completed for user ${job.data.userId}`);
});

automationQueue.on('failed', (job, err) => {
  console.error(`Automation failed:`, err.message);
});
```

---

## 5. Database Models

```typescript
// src/models/User.ts
import mongoose from 'mongoose';

interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  subscriptionEndsAt?: Date;
  automationEnabled: boolean;
  resumes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String,
    subscription: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    subscriptionEndsAt: Date,
    automationEnabled: { type: Boolean, default: true },
    resumes: [{ type: mongoose.Types.ObjectId, ref: 'Resume' }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

// src/models/Job.ts
interface IJob {
  _id: string;
  sourcePortal: 'linkedin' | 'indeed' | 'glassdoor' | 'other';
  jobUrl: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: { min: number; max: number };
  requirements: string[];
  postedDate: Date;
  scrapedDate: Date;
  aiScore?: number;
}

const jobSchema = new mongoose.Schema<IJob>(
  {
    sourcePortal: { type: String, enum: ['linkedin', 'indeed', 'glassdoor', 'other'], required: true },
    jobUrl: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    location: String,
    salary: { min: Number, max: Number },
    requirements: [String],
    postedDate: Date,
    scrapedDate: { type: Date, default: Date.now },
    aiScore: Number,
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', description: 'text' });

export const Job = mongoose.model<IJob>('Job', jobSchema);

// src/models/Application.ts
interface IApplication {
  _id: string;
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate: Date;
  appliedVia: 'auto' | 'manual' | 'extension';
  resumeUsed: { tailored: boolean; version: number };
  coverLetterGenerated: boolean;
  interviewDate?: Date;
  notes: string;
  automationLog?: {
    startTime: Date;
    endTime: Date;
    duration: number;
    errors?: string[];
  };
}

const applicationSchema = new mongoose.Schema<IApplication>(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: ['applied', 'interview', 'offer', 'rejected', 'withdrawn'], default: 'applied' },
    appliedDate: { type: Date, default: Date.now },
    appliedVia: { type: String, enum: ['auto', 'manual', 'extension'], default: 'manual' },
    resumeUsed: { tailored: Boolean, version: Number },
    coverLetterGenerated: Boolean,
    interviewDate: Date,
    notes: String,
    automationLog: {
      startTime: Date,
      endTime: Date,
      duration: Number,
      errors: [String],
    },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
```

---

## 6. API Routes Design

```typescript
// src/routes/index.ts
import express from 'express';
import authRoutes from './auth';
import jobRoutes from './jobs';
import applicationRoutes from './applications';
import resumeRoutes from './resume';
import aiRoutes from './ai';
import automationRoutes from './automation';
import analyticsRoutes from './analytics';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use('/jobs', authenticate, jobRoutes);
router.use('/applications', authenticate, applicationRoutes);
router.use('/resume', authenticate, resumeRoutes);
router.use('/ai', authenticate, aiRoutes);
router.use('/automation', authenticate, automationRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

export default router;

// src/routes/jobs.ts
import { Router } from 'express';
import { JobController } from '../controllers/jobController';

const router = Router();
const controller = new JobController();

router.get('/', controller.searchJobs);
router.get('/:id', controller.getJob);
router.post('/:id/apply', controller.applyToJob);
router.get('/:id/ai-score', controller.getAiScore);

export default router;

// src/routes/automation.ts
import { Router } from 'express';
import { AutomationController } from '../controllers/automationController';

const router = Router();
const controller = new AutomationController();

router.get('/settings', controller.getSettings);
router.put('/settings', controller.updateSettings);
router.post('/run', controller.runAutomation);
router.get('/logs', controller.getAutomationLogs);
router.get('/status/:jobId', controller.getAutomationStatus);

export default router;
```

---

## 7. Middleware Examples

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/auth/tokenService';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const payload = TokenService.verifyAccessToken(token);
    req.userId = payload.userId;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
  }

  res.status(500).json({
    message: 'Internal server error',
  });
}

// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

export const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
```

---

## 8. Controller Example

```typescript
// src/controllers/jobController.ts
import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/jobs/jobService';
import { AiService } from '../services/ai/aiService';
import { AuthenticatedRequest } from '../middleware/auth';

export class JobController {
  private jobService = new JobService();
  private aiService = new AiService();

  async searchJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, minSalary, skills, page = 1 } = req.query;

      const filters = {
        search: search as string,
        minSalary: minSalary ? parseInt(minSalary as string) : null,
        skills: skills ? (skills as string).split(',') : [],
      };

      const result = await this.jobService.searchJobs(filters, parseInt(page as string));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const job = await this.jobService.getJob(id);
      res.json(job);
    } catch (error) {
      next(error);
    }
  }

  async getAiScore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resumeId } = req.query;

      const job = await this.jobService.getJob(id);
      const resume = await resumeService.getResume(resumeId as string, req.userId!);

      const score = await this.aiService.scoreJobMatch(resume.text, job.description);
      
      res.json({ jobId: id, score });
    } catch (error) {
      next(error);
    }
  }

  async applyToJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resumeId, method = 'manual' } = req.body;

      const application = await applicationService.createApplication({
        userId: req.userId!,
        jobId: id,
        resumeId,
        appliedVia: method,
      });

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  }
}
```

---

## 9. Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env.production .

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/career-agent
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  worker:
    build:
      context: .
      dockerfile: docker/Dockerfile
    command: node dist/jobs/workers.js
    environment:
      - MONGODB_URI=mongodb://mongo:27017/career-agent
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis

volumes:
  mongo_data:
```

---

## 10. Testing Strategy

```typescript
// tests/integration/jobs.test.ts
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models/User';
import { Job } from '../../src/models/Job';
import { generateToken } from '../helpers';

describe('Jobs API', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      email: 'test@example.com',
      password: 'hashedpass',
      name: 'Test User',
    });
    userId = user._id.toString();
    token = generateToken(userId);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
  });

  describe('GET /api/v1/jobs', () => {
    it('should return jobs with filters', async () => {
      // Create test jobs
      await Job.create({
        sourcePortal: 'indeed',
        jobUrl: 'https://example.com/job/1',
        title: 'Senior Developer',
        company: 'TechCorp',
        description: 'Test job',
        location: 'Remote',
        requirements: ['JavaScript', 'React'],
      });

      const response = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${token}`)
        .query({ search: 'Developer' });

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0].title).toBe('Senior Developer');
    });
  });
});
```

---

## 11. Performance & Scaling

```typescript
// Caching Strategy
- Redis for:
  - Job listings (TTL: 1 hour)
  - User sessions
  - Rate limit counters
  - Frequently accessed data

// Database Optimization
- Indexes on frequently queried fields
- Pagination for large datasets
- Projection to select specific fields

// Queue-based Processing
- Long-running tasks (AI API calls, automation)
- Batch processing jobs
- Retry logic with exponential backoff

// Horizontal Scaling
- Stateless API servers
- Load balancing (nginx/AWS ALB)
- Database replication
- Redis clustering for caching
```

---

## 12. Backend Tech Stack Summary

```json
{
  "core": {
    "express": "^4.18.0",
    "node": ">=20.0.0"
  },
  "database": {
    "mongoose": "^7.0.0",
    "mongodb": "^5.0.0"
  },
  "queuing": {
    "bull": "^4.0.0",
    "redis": "^4.0.0"
  },
  "automation": {
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0"
  },
  "ai": {
    "openai": "^4.0.0",
    "@google/generative-ai": "^0.1.0"
  },
  "security": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.0",
    "helmet": "^7.0.0"
  },
  "testing": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  },
  "logging": {
    "winston": "^3.8.0",
    "morgan": "^1.10.0"
  }
}
```

---

**This backend architecture is production-ready, scalable, and follows industry best practices. Next: Database Schema & Infrastructure →**
