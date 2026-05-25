import { User, IUser } from './models/User';
import { Resume } from './models/Resume';
import { Job } from './models/Job';
import { Application } from './models/Application';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './utils/jwt';
import { errors } from './utils/errors';
import { MOCK_JOBS, MOCK_APPLICATIONS, MOCK_USERS, generateUserId } from './mockData';
import bcryptjs from 'bcryptjs';
import { isMongoUnavailable } from './config/mongoState';
import { jobFetcher } from './services/jobFetcher';

// ============================================
// AUTH SERVICE
// ============================================
export class AuthService {
  // Check if using mock data (returns true when MongoDB is unavailable)
  static useMockData = () => isMongoUnavailable();

  static async signup(email: string, password: string, name: string) {
    // Use mock users if database is not available
    if (this.useMockData()) {
      const existingMockUser = MOCK_USERS.find(u => u.email === email);
      if (existingMockUser) {
        throw errors.conflict('Email already registered');
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const userId = generateUserId();
      const mockUser = {
        _id: userId,
        email,
        name,
        password: hashedPassword,
      };

      MOCK_USERS.push(mockUser);

      const accessToken = generateAccessToken(userId, email);
      const refreshToken = generateRefreshToken(userId);

      return {
        user: {
          id: userId,
          email,
          name,
        },
        accessToken,
        refreshToken,
      };
    }

    // Use database if available
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw errors.conflict('Email already registered');
    }

    const user = await User.create({ email, password, name });
    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(email: string, password: string) {
    // Use mock users if database is not available
    if (this.useMockData()) {
      const mockUser = MOCK_USERS.find(u => u.email === email);
      if (!mockUser) {
        throw errors.badRequest('Invalid email or password');
      }

      const isPasswordValid = await bcryptjs.compare(password, mockUser.password);
      if (!isPasswordValid) {
        throw errors.badRequest('Invalid email or password');
      }

      const accessToken = generateAccessToken(mockUser._id, email);
      const refreshToken = generateRefreshToken(mockUser._id);

      return {
        user: {
          id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
        },
        accessToken,
        refreshToken,
      };
    }

    // Use database if available
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw errors.badRequest('Invalid email or password');
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw errors.badRequest('Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshTokens(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      
      // Use mock users if database is unavailable
      if (this.useMockData()) {
        const mockUser = MOCK_USERS.find(u => u._id === payload.userId);
        if (!mockUser) {
          throw errors.unauthorized();
        }
        const newAccessToken = generateAccessToken(mockUser._id, mockUser.email);
        const newRefreshToken = generateRefreshToken(mockUser._id);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
      }
      
      // Use database if available
      const user = await User.findById(payload.userId);
      if (!user) {
        throw errors.unauthorized();
      }

      const newAccessToken = generateAccessToken(user._id.toString(), user.email);
      const newRefreshToken = generateRefreshToken(user._id.toString());

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw errors.unauthorized();
    }
  }

  static async getUser(userId: string) {
    // Use mock users if database is unavailable
    if (this.useMockData()) {
      const mockUser = MOCK_USERS.find(u => u._id === userId);
      if (!mockUser) {
        throw errors.notFound('User');
      }
      return mockUser;
    }
    
    // Use database if available
    const user = await User.findById(userId);
    if (!user) {
      throw errors.notFound('User');
    }
    return user;
  }
}

// ============================================
// RESUME SERVICE
// ============================================
export class ResumeService {
  static async uploadResume(userId: string, fileName: string, filePath: string, fileSize: number) {
    // TODO: PHASE 2 - Extract text from PDF/DOC
    // For now, just store the file info

    const resume = await Resume.create({
      userId,
      fileName,
      filePath,
      fileSize,
      extractedText: '',
      skills: [],
      experience: '',
      education: '',
    });

    return resume;
  }

  static async getUserResumes(userId: string) {
    return await Resume.find({ userId }).sort({ createdAt: -1 });
  }

  static async getResume(userId: string, resumeId: string) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw errors.notFound('Resume');
    }
    return resume;
  }

  static async deleteResume(userId: string, resumeId: string) {
    const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
    if (!resume) {
      throw errors.notFound('Resume');
    }
    return resume;
  }

  // TODO: PHASE 2 - AI Resume Analysis
  // static async analyzeResume(resumeId: string) { }

  // TODO: PHASE 2 - Tailor Resume for job
  // static async tailorResume(resumeId: string, jobId: string) { }
}

// ============================================
// JOB SERVICE
// ============================================
export class JobService {
  static async searchJobs(filters: {
    search?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    sourcePortal?: string;
    page?: number;
  }) {
    const page = filters.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Determine which API source to use
    let source = 'public_api'; // Try real APIs first
    if (filters.sourcePortal) {
      if (filters.sourcePortal === 'remoteok') source = 'remoteok';
      else source = 'public_api';
    }

    // Fetch from job APIs (will fall back to mock if needed)
    console.log(`🔍 Searching jobs with source: ${source}, query: ${filters.search}`);
    const jobs = await jobFetcher.getJobs(source, filters.search);

    // Apply filtering
    let filtered = jobs;

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationLower)
      );
    }

    // Sort by posted date (newest first)
    filtered.sort((a, b) => new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());

    // Paginate and normalize IDs
    const total = filtered.length;
    const paginatedJobs = filtered.slice(skip, skip + limit).map((job, idx) => ({
      ...job,
      _id: (job as any)._id || job.id || `job-${skip + idx}-${Date.now()}`,
    }));

    console.log(`✅ Found ${total} jobs, returning ${paginatedJobs.length}`);

    return {
      jobs: paginatedJobs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  static async getJob(jobId: string) {
    // Try multiple times to fetch all jobs
    let jobs: any[] = [];
    
    // Try real APIs first
    jobs = await jobFetcher.getJobs('public_api');
    
    // Find the job by ID
    let job = jobs.find(j => j.id === jobId);
    
    if (!job) {
      // Try again with mock data
      jobs = await jobFetcher.getJobs('mock');
      job = jobs.find(j => j.id === jobId);
    }
    
    if (!job) {
      throw errors.notFound('Job');
    }
    
    // Format to match expected response
    return {
      _id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || 'No description provided',
      requirements: job.requirements || [],
      salary: job.salary || { min: 0, max: 0 },
      sourcePortal: job.source,
      externalJobId: job.id,
      externalUrl: job.url,
      postedDate: job.posted_at || new Date(),
    };
  }

  static async createJob(jobData: any) {
    // For now, just return the job data as-is
    // In Phase 2, this will save to MongoDB
    return {
      _id: jobData.id,
      ...jobData,
    };
  }

  // TODO: PHASE 2 - Job scraping integration
  // static async scrapeJobs(portal: 'indeed' | 'linkedin' | 'glassdoor') { }

  // TODO: PHASE 2 - AI Job matching
  // static async matchJobsWithResume(userId: string, resumeId: string) { }
}

// ============================================
// APPLICATION SERVICE
// ============================================
export class ApplicationService {
  static async applyToJob(
    userId: string,
    jobId: string,
    jobTitle: string,
    company: string,
    sourcePortal: string = 'unknown',
    resumeUsed?: string,
    automatedApply?: boolean
  ) {
    // Check for duplicate application in mock data
    const existingApp = MOCK_APPLICATIONS.find(a => a.userId === userId && a.jobId === jobId);
    if (existingApp) {
      throw errors.conflict('Already applied to this job');
    }

    // Create application in mock data
    const newApplication = {
      _id: String(Date.now() + Math.random()),
      userId,
      jobId,
      jobTitle,
      company,
      appliedDate: new Date(),
      status: 'applied' as const,
      sourcePortal: sourcePortal as any,
      automatedApply: automatedApply || false,
      resumeUsed,
    };

    MOCK_APPLICATIONS.push(newApplication);

    return newApplication;
  }

  static async getUserApplications(
    userId: string,
    filters?: {
      status?: string;
      sourcePortal?: string;
      page?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Filter from mock data
    let filtered = MOCK_APPLICATIONS.filter(app => app.userId === userId);

    if (filters?.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters?.sourcePortal) {
      filtered = filtered.filter(app => app.sourcePortal === filters.sourcePortal);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

    const total = filtered.length;
    const applications = filtered.slice(skip, skip + limit);

    return {
      applications,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  static async updateApplicationStatus(
    userId: string,
    applicationId: string,
    status: 'applied' | 'rejected' | 'interview' | 'offer' | 'pending'
  ) {
    const application = MOCK_APPLICATIONS.find(a => a._id === applicationId && a.userId === userId);

    if (!application) {
      throw errors.notFound('Application');
    }

    application.status = status;
    return application;
  }

  static async getApplicationStats(userId: string) {
    const userApps = MOCK_APPLICATIONS.filter(app => app.userId === userId);
    
    const statsByStatus: any = {};
    userApps.forEach(app => {
      if (!statsByStatus[app.status]) {
        statsByStatus[app.status] = 0;
      }
      statsByStatus[app.status]++;
    });

    return Object.entries(statsByStatus).map(([status, count]) => ({
      _id: status,
      count,
    }));
  }

  // Candidate Profile Management
  static async getCandidateProfile(userId: string) {
    // Return profile or empty object if not exists
    const profile = MOCK_APPLICATIONS.find(a => a.userId === userId && a._id.includes('profile'));
    
    if (profile) {
      return profile;
    }

    // Return default profile structure
    return {
      phone: '',
      linkedin: '',
      careerLevel: 'Mid',
      yearsOfExperience: 0,
      skills: '',
      jobPreferences: {
        preferredRoles: '',
        preferredLocations: '',
        preferredIndustries: '',
        minSalary: 0,
        maxSalary: 200000,
      },
    };
  }

  static async saveCandidateProfile(userId: string, profileData: any) {
    // For mock data, store in memory (in production, save to MongoDB)
    const profileRecord = {
      _id: `profile_${userId}_${Date.now()}`,
      userId,
      ...profileData,
      updatedAt: new Date(),
    };

    MOCK_APPLICATIONS.push(profileRecord);

    return profileRecord;
  }

  // TODO: PHASE 2 - Auto-apply functionality
  // static async autoApplyToJobs(userId: string, filters: any) { }

  // TODO: PHASE 2 - Track application status (scrape portals)
  // static async checkApplicationStatus(applicationId: string) { }
}
