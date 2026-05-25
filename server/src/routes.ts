import { Router } from 'express';
import { authMiddleware } from './middleware/auth';
import { upload } from './middleware/fileUpload';
import {
  signup,
  login,
  refreshToken,
  getProfile,
  uploadResume,
  getUserResumes,
  deleteResume,
  searchJobs,
  getJob,
  applyToJob,
  getUserApplications,
  updateApplicationStatus,
  getApplicationStats,
  getCandidateProfile,
  saveCandidateProfile,
} from './controllers';

const router = Router() as any;

// ============================================
// AUTH ROUTES
// ============================================
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/refresh', refreshToken);
router.get('/auth/profile', authMiddleware, getProfile);

// ============================================
// RESUME ROUTES
// ============================================
router.post('/resume/upload', authMiddleware, upload.single('resume'), uploadResume);
router.get('/resume', authMiddleware, getUserResumes);
router.delete('/resume/:resumeId', authMiddleware, deleteResume);

// ============================================
// CANDIDATE PROFILE ROUTES
// ============================================
router.get('/profile', authMiddleware, getCandidateProfile);
router.post('/profile', authMiddleware, saveCandidateProfile);

// TODO: PHASE 2
// router.get('/resume/:resumeId/analyze', authMiddleware, analyzeResume);
// router.post('/resume/:resumeId/tailor', authMiddleware, tailorResume);

// ============================================
// JOB ROUTES
// ============================================
router.get('/jobs/search', searchJobs);
router.get('/jobs/:jobId', getJob);

// TODO: PHASE 2 - Auto-scraping
// router.post('/jobs/scrape', authMiddleware, scrapeJobs);

// ============================================
// APPLICATION ROUTES
// ============================================
router.post('/applications/apply', authMiddleware, applyToJob);
router.get('/applications', authMiddleware, getUserApplications);
router.put('/applications/:applicationId/status', authMiddleware, updateApplicationStatus);
router.get('/applications/stats', authMiddleware, getApplicationStats);

// TODO: PHASE 2
// router.post('/applications/auto-apply', authMiddleware, autoApplyToJobs);
// router.post('/applications/:applicationId/check-status', authMiddleware, checkStatus);

export default router;
