import { Request, Response, NextFunction } from 'express';
import { AuthService, ResumeService, JobService, ApplicationService } from './services';
import { AppError } from './utils/errors';

// ============================================
// AUTH CONTROLLERS
// ============================================
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }

    const result = await AuthService.signup(email, password, name);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const result = await AuthService.refreshTokens(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await AuthService.getUser(userId);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// RESUME CONTROLLERS
// ============================================
export const uploadResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const resume = await ResumeService.uploadResume(
      userId,
      req.file.originalname,
      req.file.path,
      req.file.size
    );

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserResumes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const resumes = await ResumeService.getUserResumes(userId);

    res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { resumeId } = req.params;

    await ResumeService.deleteResume(userId, resumeId);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// JOB CONTROLLERS
// ============================================
export const searchJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, location, minSalary, maxSalary, sourcePortal, page } = req.query;

    const filters = {
      search: search as string,
      location: location as string,
      minSalary: minSalary ? parseInt(minSalary as string) : undefined,
      maxSalary: maxSalary ? parseInt(maxSalary as string) : undefined,
      sourcePortal: sourcePortal as string,
      page: page ? parseInt(page as string) : 1,
    };

    const result = await JobService.searchJobs(filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    const job = await JobService.getJob(jobId);

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// APPLICATION CONTROLLERS
// ============================================
export const applyToJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { jobId, jobTitle, company, sourcePortal, resumeUsed, automatedApply } = req.body;

    if (!jobId || !jobTitle || !company) {
      throw new AppError('Job ID, job title, and company are required', 400);
    }

    const application = await ApplicationService.applyToJob(
      userId,
      jobId,
      jobTitle,
      company,
      sourcePortal || 'github',
      resumeUsed,
      automatedApply
    );

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { status, sourcePortal, page } = req.query;

    const filters = {
      status: status as string,
      sourcePortal: sourcePortal as string,
      page: page ? parseInt(page as string) : 1,
    };

    const result = await ApplicationService.getUserApplications(userId, filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const application = await ApplicationService.updateApplicationStatus(userId, applicationId, status);

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const stats = await ApplicationService.getApplicationStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CANDIDATE PROFILE CONTROLLERS
// ============================================
export const getCandidateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const profile = await ApplicationService.getCandidateProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const saveCandidateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const profileData = req.body;

    const profile = await ApplicationService.saveCandidateProfile(userId, profileData);

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
