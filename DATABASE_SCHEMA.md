# Database Schema & Data Models
**MongoDB Design for AI Career Agent SaaS**

---

## 1. Collections Overview

```
Users
├─ Resumes
├─ Applications
├─ Subscriptions
└─ Automation Logs

Jobs
├─ Job Metadata
├─ Requirements
└─ AI Scores

Portals
├─ Portal Configurations
└─ Portal Credentials

Analytics
├─ Events
├─ Conversions
└─ User Metrics
```

---

## 2. Core Collections

### Users Collection

```javascript
{
  _id: ObjectId,
  
  // Authentication
  email: "user@example.com",
  password: "bcrypted_hash",
  emailVerified: true,
  emailVerifiedAt: ISODate,
  
  // Profile
  name: "John Doe",
  avatar: "https://cdn.example.com/avatars/user_123.jpg",
  bio: "Software Engineer looking for next opportunity",
  
  // Subscription
  subscription: {
    plan: "pro", // 'free', 'pro', 'enterprise'
    status: "active", // 'active', 'canceled', 'expired'
    startedAt: ISODate,
    endsAt: ISODate,
    autoRenewal: true,
    stripeCustomerId: "cus_xxx",
    stripeSubscriptionId: "sub_xxx"
  },
  
  // Limits (based on plan)
  limits: {
    monthlyApplications: 100,
    monthlyUsed: 45,
    resumeLimit: 5,
    resumes: 3,
    aiTailoringLimit: 200,
    automationEnabled: true
  },
  
  // Settings
  settings: {
    language: "en",
    timezone: "UTC",
    notifications: {
      emailOnApplication: true,
      emailOnInterview: true,
      emailOnRejection: false,
      digestFrequency: "daily" // 'instant', 'daily', 'weekly'
    },
    privacy: {
      profileVisibility: "private",
      shareAnalytics: true
    }
  },
  
  // Preferences
  preferences: {
    desiredRoles: ["Senior Developer", "Tech Lead"],
    desiredLocations: ["Remote", "San Francisco"],
    desiredSalary: { min: 120000, max: 180000 },
    keywordsToInclude: ["TypeScript", "React", "Node.js"],
    keywordsToExclude: ["relocation required"],
    maxCommute: 50 // km
  },
  
  // References
  resumes: [
    {
      resumeId: ObjectId,
      isPrimary: true,
      version: 1,
      createdAt: ISODate
    }
  ],
  
  // Status
  status: "active", // 'active', 'suspended', 'deleted'
  lastLoginAt: ISODate,
  lastActivityAt: ISODate,
  
  // Metadata
  createdAt: ISODate,
  updatedAt: ISODate,
  deletedAt: ISODate // null if not deleted
}
```

### Resumes Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  
  // Basic Info
  name: "Senior Developer Resume",
  version: 1,
  isPrimary: true,
  
  // File Storage
  file: {
    originalName: "Resume_John_Doe.pdf",
    mimeType: "application/pdf",
    size: 245000, // bytes
    s3Key: "resumes/user_123/resume_v1.pdf",
    s3Url: "https://s3.amazonaws.com/...",
    uploadedAt: ISODate
  },
  
  // Parsed Content (extracted from PDF/DOCX)
  parsedContent: {
    text: "Full resume text...",
    
    // AI-extracted structured data
    personalInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1-555-0123",
      location: "San Francisco, CA"
    },
    
    summary: "Experienced full-stack developer...",
    
    experience: [
      {
        company: "TechCorp",
        position: "Senior Developer",
        startDate: "2020-01",
        endDate: "present",
        description: "Led development of...",
        skills: ["JavaScript", "React", "Node.js"],
        achievements: ["Increased performance by 40%", "Led team of 5"]
      }
    ],
    
    education: [
      {
        institution: "MIT",
        degree: "BS Computer Science",
        graduationYear: 2015,
        gpa: "3.8"
      }
    ],
    
    skills: [
      { name: "JavaScript", level: 5 },
      { name: "React", level: 5 },
      { name: "Node.js", level: 4 },
      { name: "Python", level: 3 }
    ],
    
    certifications: [
      {
        name: "AWS Solutions Architect",
        issuer: "AWS",
        issuedDate: "2022-06"
      }
    ],
    
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Spanish", proficiency: "intermediate" }
    ],
    
    // Extracted keywords for matching
    keywords: ["javascript", "typescript", "react", "node", "cloud", "aws"]
  },
  
  // AI Analysis
  aiAnalysis: {
    strength: 85, // Overall resume strength (0-100)
    suggestions: [
      "Add more quantifiable achievements",
      "Include specific technologies used"
    ],
    keyStrengths: ["Strong technical skills", "Good career progression"],
    recommendations: {
      format: "Modern format with good structure",
      content: "Strong content, but could add more metrics",
      keywords: "Good keyword density for tech roles"
    }
  },
  
  // Tailoring History
  tailoringHistory: [
    {
      jobId: ObjectId,
      tailoredAt: ISODate,
      tailoredVersion: 1,
      score: 87 // Match score for this job
    }
  ],
  
  // Status
  status: "active", // 'active', 'archived', 'deleted'
  parsingStatus: "completed", // 'pending', 'completed', 'failed'
  
  createdAt: ISODate,
  updatedAt: ISODate,
  parsedAt: ISODate
}
```

### Jobs Collection

```javascript
{
  _id: ObjectId,
  
  // Source Information
  sourcePortal: "indeed", // 'linkedin', 'indeed', 'glassdoor', 'angellist', 'other'
  sourceJobId: "job_12345678", // Portal's own ID if available
  jobUrl: "https://indeed.com/jobs/view/12345678",
  
  // Job Details
  title: "Senior Full-Stack Developer",
  company: "TechCorp Inc",
  location: {
    city: "San Francisco",
    state: "CA",
    country: "USA",
    isRemote: true,
    timezone: "PST"
  },
  
  description: "We're looking for a senior full-stack developer...",
  
  // Requirements & Skills
  requirements: [
    "5+ years of JavaScript/Node.js experience",
    "Experience with React or Vue.js",
    "Strong backend API design skills",
    "Experience with cloud platforms (AWS/GCP)",
    "Excellent communication skills"
  ],
  
  skills: [
    { name: "JavaScript", required: true, level: 5 },
    { name: "React", required: true, level: 4 },
    { name: "Node.js", required: true, level: 5 },
    { name: "AWS", required: false, level: 3 },
    { name: "Docker", required: false, level: 3 }
  ],
  
  // Compensation
  salary: {
    currency: "USD",
    min: 120000,
    max: 180000,
    period: "annual", // 'annual', 'hourly'
    includesBenefits: true
  },
  
  benefits: [
    "Health insurance",
    "401k matching",
    "Unlimited PTO",
    "Remote work",
    "Stock options"
  ],
  
  // Job Type
  jobType: "full-time", // 'full-time', 'part-time', 'contract', 'temporary'
  seniority: "senior", // 'entry', 'mid', 'senior', 'lead'
  
  // Company Info
  company_info: {
    name: "TechCorp Inc",
    industry: "Software Development",
    size: "1000-5000",
    founded: 2010,
    website: "https://techcorp.com",
    logo_url: "https://...",
    glassdoor_rating: 4.5,
    reviews_count: 1234
  },
  
  // Timeline
  postedDate: ISODate,
  closingDate: ISODate,
  scrapedDate: ISODate,
  lastSeenDate: ISODate,
  
  // AI Analysis
  aiAnalysis: {
    parsed: true,
    parsingQuality: 0.92, // 0-1
    requiredSkillsExtracted: ["JavaScript", "React", "Node.js"],
    suggestedSkillsForResume: ["AWS", "Docker", "Git"],
    difficulty: "medium", // 'easy', 'medium', 'hard'
    trend: "high_demand" // 'high_demand', 'medium', 'low'
  },
  
  // Matching & Scoring
  matchScores: [
    {
      resumeId: ObjectId,
      userId: ObjectId,
      score: 87, // 0-100
      scoredAt: ISODate,
      matchReason: "Strong technical fit, all required skills present"
    }
  ],
  
  // Application History
  applicationCount: 156,
  uniqueUserApplications: 123,
  avgTimeToFill: 8, // days
  
  // Status
  status: "active", // 'active', 'closed', 'archived', 'spam'
  isSpam: false,
  
  createdAt: ISODate,
  updatedAt: ISODate,
  expiresAt: ISODate // Auto-delete old jobs
}
```

### Applications Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  jobId: ObjectId,
  resumeId: ObjectId,
  
  // Application Status
  status: "applied", // 'applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn'
  statusHistory: [
    { status: "applied", changedAt: ISODate },
    { status: "reviewing", changedAt: ISODate },
    { status: "interview", changedAt: ISODate }
  ],
  
  // Application Method
  appliedVia: "auto", // 'auto', 'manual', 'extension', 'api'
  automationLog: {
    success: true,
    startedAt: ISODate,
    completedAt: ISODate,
    duration: 45000, // milliseconds
    steps: [
      { action: "navigate", status: "success", timestamp: ISODate },
      { action: "fill_form", status: "success", timestamp: ISODate },
      { action: "submit", status: "success", timestamp: ISODate }
    ],
    error: null,
    retries: 0
  },
  
  // Content Used
  content: {
    resume: {
      version: 1,
      tailored: true,
      text: "Tailored resume text..."
    },
    coverLetter: {
      generated: true,
      generatedAt: ISODate,
      text: "Dear Hiring Manager..."
    },
    customAnswers: [
      { question: "Why do you want this job?", answer: "...", customized: true }
    ]
  },
  
  // AI Analysis
  aiAnalysis: {
    matchScore: 87, // 0-100
    reasonsGood: [
      "All required skills present",
      "Experience aligns well",
      "Salary expectations match"
    ],
    reasonsMissing: [
      "No Docker experience mentioned",
      "Limited cloud experience"
    ],
    competitorDifficulty: "high" // Based on job difficulty
  },
  
  // Interview & Response
  interview: {
    scheduled: true,
    interviewDate: ISODate,
    interviewType: "phone_screen", // 'phone_screen', 'technical', 'onsite', 'final'
    interviewers: ["John Smith", "Jane Doe"],
    rounds: 3,
    roundsPassed: 2
  },
  
  feedback: {
    recruiter: "Great technical skills",
    interviewer: "Strong problem-solving",
    status: "advancing_to_next_round",
    rating: 8.5
  },
  
  // Offer (if applicable)
  offer: {
    status: "pending", // 'pending', 'accepted', 'rejected', 'negotiating'
    position: "Senior Full-Stack Developer",
    salary: 150000,
    bonus: 20000,
    equity: 0.1,
    startDate: ISODate,
    negotiationNotes: "Asked for additional equity"
  },
  
  // Communication
  emails: [
    { from: "recruiter@techcorp.com", subject: "Thank you for applying", date: ISODate },
    { from: "support@techcorp.com", subject: "Interview scheduled", date: ISODate }
  ],
  
  notes: [
    { author: "user", text: "Great company culture", createdAt: ISODate },
    { author: "system", text: "Interview reminder", createdAt: ISODate }
  ],
  
  // Tracking
  visibility: {
    hidden: false, // User can hide applications
    archived: false
  },
  
  reminders: [
    { type: "follow_up", scheduledFor: ISODate, sent: false }
  ],
  
  // Dates
  appliedAt: ISODate,
  withdrawnAt: ISODate, // null if not withdrawn
  rejectedAt: ISODate, // null if not rejected
  offerAcceptedAt: ISODate,
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Automation Logs Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  
  // Batch Info
  batchId: "batch_20240101_120000",
  startedAt: ISODate,
  completedAt: ISODate,
  duration: 3600000, // milliseconds
  
  // Configuration
  config: {
    portal: "indeed",
    targetCount: 20,
    minScore: 70,
    maxApplicationsPerHour: 10
  },
  
  // Results
  results: {
    attempted: 20,
    successful: 18,
    failed: 2,
    applicationsCreated: 18
  },
  
  // Jobs Processed
  jobsProcessed: [
    {
      jobId: ObjectId,
      success: true,
      duration: 45000,
      steps: ["navigate", "fill_form", "submit"],
      error: null,
      applicationId: ObjectId
    }
  ],
  
  // Errors
  errors: [
    {
      jobId: ObjectId,
      step: "submit",
      errorMessage: "Form validation failed",
      errorCode: "FORM_VALIDATION_ERROR",
      retry: { attempt: 1, nextRetryAt: ISODate }
    }
  ],
  
  // System Info
  system: {
    userAgent: "Mozilla/5.0 ...",
    ipAddress: "192.168.1.1",
    browserType: "chrome",
    headless: true
  },
  
  status: "completed", // 'running', 'completed', 'failed', 'paused'
  
  createdAt: ISODate
}
```

### Analytics Events Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: String,
  
  // Event Info
  event: "job_applied", // 'job_viewed', 'job_applied', 'resume_uploaded', etc.
  category: "application",
  
  // Related Objects
  jobId: ObjectId,
  applicationId: ObjectId,
  resumeId: ObjectId,
  
  // Event Data
  data: {
    source: "dashboard",
    appliedVia: "auto",
    timeSpent: 120, // seconds
    score: 87
  },
  
  // User Context
  userContext: {
    plan: "pro",
    applicationCount: 25,
    resumeCount: 2
  },
  
  // Device Info
  device: {
    type: "desktop",
    os: "Windows",
    browser: "Chrome"
  },
  
  // Timestamps
  timestamp: ISODate,
  createdAt: ISODate
}
```

### Subscriptions Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  
  // Plan Info
  planId: "pro_monthly",
  planName: "Pro",
  billlingCycle: "monthly", // 'monthly', 'annually'
  
  // Stripe Integration
  stripeCustomerId: "cus_xxx",
  stripeSubscriptionId: "sub_xxx",
  stripePriceId: "price_xxx",
  
  // Payment
  status: "active", // 'active', 'past_due', 'canceled', 'expired'
  currentPeriodStart: ISODate,
  currentPeriodEnd: ISODate,
  
  // Features
  features: {
    monthlyApplicationLimit: 100,
    aiTailoringLimit: 200,
    resumeLimit: 5,
    automationEnabled: true,
    prioritySupport: true,
    analytics: true
  },
  
  // Payment History
  payments: [
    {
      stripePaymentId: "ch_xxx",
      amount: 4900, // cents
      currency: "usd",
      paidAt: ISODate,
      status: "succeeded"
    }
  ],
  
  // Dates
  startedAt: ISODate,
  canceledAt: ISODate,
  expiresAt: ISODate,
  
  // Cancellation Reason
  cancellationReason: "too_expensive",
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## 3. Indexes for Performance

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ "subscription.plan": 1 })

// Resumes
db.resumes.createIndex({ userId: 1, isPrimary: 1 })
db.resumes.createIndex({ userId: 1, createdAt: -1 })

// Jobs
db.jobs.createIndex({ jobUrl: 1 }, { unique: true })
db.jobs.createIndex({ sourcePortal: 1, postedDate: -1 })
db.jobs.createIndex({ title: "text", description: "text", company: "text" })
db.jobs.createIndex({ salary.min: 1, salary.max: 1 })
db.jobs.createIndex({ "location.isRemote": 1 })
db.jobs.createIndex({ status: 1, expiresAt: 1 })

// Applications
db.applications.createIndex({ userId: 1, createdAt: -1 })
db.applications.createIndex({ jobId: 1 })
db.applications.createIndex({ userId: 1, status: 1 })
db.applications.createIndex({ appliedAt: -1 })

// Automation Logs
db.automationLogs.createIndex({ userId: 1, startedAt: -1 })
db.automationLogs.createIndex({ batchId: 1 }, { unique: true })

// Analytics Events
db.analyticsEvents.createIndex({ userId: 1, timestamp: -1 })
db.analyticsEvents.createIndex({ event: 1, timestamp: -1 })
db.analyticsEvents.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }) // 90 days
```

---

## 4. Data Relationships Diagram

```
User
├── owns many Resumes
├── has one Subscription
├── creates many Applications
├── has many AutomationLogs
└── generates many AnalyticsEvents

Resume
├── belongs to User
├── has many TailoringHistories (references Jobs)
└── used in many Applications

Job
├── has many Applications
├── has many MatchScores (for multiple resumes)
└── referenced in TailoringHistories

Application
├── belongs to User
├── references Job
├── references Resume
└── has many related AnalyticsEvents

AutomationLog
├── belongs to User
└── processes many Jobs
```

---

## 5. Data Validation & Constraints

```javascript
// User Creation Validation
{
  email: { type: String, required: true, unique: true, match: /^[^@]+@[^@]+\.[^@]+$/ },
  password: { type: String, required: true, minlength: 8 },
  name: { type: String, required: true, minlength: 2, maxlength: 100 }
}

// Job Creation Validation
{
  title: { type: String, required: true, minlength: 5, maxlength: 255 },
  company: { type: String, required: true },
  description: { type: String, required: true, minlength: 50 },
  salary: {
    min: { type: Number, min: 0 },
    max: { type: Number, validate: { validator: function(v) { return !this.salary.min || v >= this.salary.min; } } }
  },
  jobUrl: { type: String, required: true, unique: true, match: /^https?:\/\// }
}

// Application Validation
{
  status: { type: String, enum: ['applied', 'interview', 'offer', 'rejected', 'withdrawn'] },
  jobId: { type: ObjectId, required: true, ref: 'Job' },
  userId: { type: ObjectId, required: true, ref: 'User' }
}
```

---

## 6. Aggregation Pipeline Examples

### Get User Application Stats

```javascript
db.applications.aggregate([
  { $match: { userId: ObjectId("...") } },
  {
    $facet: {
      byStatus: [
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ],
      timeline: [
        { $sort: { appliedAt: -1 } },
        { $limit: 10 }
      ],
      successRate: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            interviews: { $sum: { $cond: [{ $eq: ["$status", "interview"] }, 1, 0] } },
            offers: { $sum: { $cond: [{ $eq: ["$status", "offer"] }, 1, 0] } }
          }
        }
      ]
    }
  }
])
```

### Get Job Matching Statistics

```javascript
db.applications.aggregate([
  { $match: { userId: ObjectId("..."), status: { $in: ["interview", "offer"] } } },
  {
    $lookup: {
      from: "jobs",
      localField: "jobId",
      foreignField: "_id",
      as: "job"
    }
  },
  { $unwind: "$job" },
  {
    $group: {
      _id: "$job.sourcePortal",
      count: { $sum: 1 },
      avgScore: { $avg: "$aiAnalysis.matchScore" }
    }
  }
])
```

---

## 7. Data Retention & Privacy

```javascript
// Auto-delete old jobs (older than 90 days)
db.jobs.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 } // 90 days
)

// Archive old applications (older than 2 years)
db.applications.updateMany(
  { createdAt: { $lt: new Date(Date.now() - 63072000000) } },
  { $set: { archived: true } }
)

// Anonymize deleted user data
db.applications.updateMany(
  { userId: deletedUserId },
  {
    $unset: { userId: 1 },
    $set: { anonymized: true, anonymizedAt: new Date() }
  }
)
```

---

**Database schema is production-ready with proper indexing, validation, and scalability considerations.**
