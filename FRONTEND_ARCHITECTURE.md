# Frontend Architecture & Implementation Plan
**AI Career Agent - React + Tailwind SaaS**

---

## 1. Tech Stack Rationale

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 18+ | Best-in-class state management, ecosystem, DX |
| **Styling** | Tailwind CSS | Rapid development, consistent design, low CSS overhead |
| **State Management** | Redux Toolkit | Predictable state, devtools, middleware for logging |
| **HTTP Client** | Axios + Interceptors | Request/response logging, auth token refresh, retry logic |
| **UI Components** | Shadcn/ui or Headless UI | Accessible, customizable, production-ready |
| **Forms** | React Hook Form + Zod | Type-safe forms, minimal re-renders, validation |
| **Charts** | Recharts or Chart.js | Job/interview analytics visualizations |
| **Tables** | TanStack Table (React Table) | Sorting, filtering, pagination, large datasets |
| **Auth** | JWT + Refresh tokens | Stateless, scalable, industry standard |
| **Routing** | React Router v6 | File-based routing, nested layouts, data loading |
| **Browser Extension** | Manifest v3 + React | Chrome/Firefox automation helper |
| **Build Tool** | Vite | Lightning-fast development, optimized bundles |
| **Testing** | Vitest + React Testing Library | Unit & integration tests |
| **E2E Testing** | Cypress or Playwright | User flow testing |
| **Deployment** | Vercel or AWS Amplify | Zero-config, CDN, auto-scaling |

---

## 2. Project Folder Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── manifest.json (PWA)
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Modal.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── TokenRefresh.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── StatisticsCard.tsx
│   │   │   ├── JobFeed.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── jobs/
│   │   │   ├── JobList.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobDetail.tsx
│   │   │   ├── JobFilter.tsx
│   │   │   └── ApplyButton.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationsList.tsx
│   │   │   ├── ApplicationDetail.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── TimelineView.tsx
│   │   ├── resume/
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── ResumePreview.tsx
│   │   │   ├── ResumeEditor.tsx
│   │   │   └── VersionHistory.tsx
│   │   ├── ai/
│   │   │   ├── AiTailorForm.tsx
│   │   │   ├── CoverLetterPreview.tsx
│   │   │   ├── InterviewPrep.tsx
│   │   │   └── AiRecommendations.tsx
│   │   ├── settings/
│   │   │   ├── AutomationSettings.tsx
│   │   │   ├── PortalPreferences.tsx
│   │   │   ├── NotificationPreferences.tsx
│   │   │   └── SubscriptionPlan.tsx
│   │   └── analytics/
│   │       ├── DashboardAnalytics.tsx
│   │       ├── ConversionFunnel.tsx
│   │       ├── JobSourceChart.tsx
│   │       └── InterviewStats.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Jobs.tsx
│   │   ├── Applications.tsx
│   │   ├── Resume.tsx
│   │   ├── Settings.tsx
│   │   ├── Analytics.tsx
│   │   ├── InterviewPrep.tsx
│   │   └── NotFound.tsx
│   │
│   ├── services/
│   │   ├── api.ts (Axios instance + interceptors)
│   │   ├── authService.ts
│   │   ├── jobService.ts
│   │   ├── applicationService.ts
│   │   ├── resumeService.ts
│   │   ├── aiService.ts
│   │   ├── automationService.ts
│   │   └── analyticsService.ts
│   │
│   ├── store/
│   │   ├── store.ts (Redux setup)
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── jobsSlice.ts
│   │   │   ├── applicationsSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── uiSlice.ts (modals, loading states)
│   │   │   └── settingsSlice.ts
│   │   └── thunks/
│   │       ├── authThunks.ts
│   │       ├── jobThunks.ts
│   │       └── applicationThunks.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useFetch.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useNotification.ts
│   │   └── useWindowSize.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts (date, currency, etc.)
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   ├── errorHandler.ts
│   │   ├── localStorage.ts
│   │   └── helpers.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── job.ts
│   │   ├── application.ts
│   │   ├── resume.ts
│   │   ├── ai.ts
│   │   └── api.ts
│   │
│   ├── styles/
│   │   ├── globals.css (Tailwind + custom utilities)
│   │   ├── animations.css
│   │   └── responsive.css
│   │
│   ├── App.tsx (Main router setup)
│   ├── main.tsx (Entry point)
│   └── vite-env.d.ts
│
├── extension/
│   ├── manifest.json
│   ├── src/
│   │   ├── content.ts (Content script)
│   │   ├── background.ts (Service worker)
│   │   ├── popup.tsx (Popup UI)
│   │   └── injected.ts (Page injection)
│   └── public/
│       ├── icon-16.png
│       ├── icon-32.png
│       └── icon-128.png
│
├── tests/
│   ├── unit/
│   │   ├── components.test.tsx
│   │   ├── hooks.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   └── auth.test.tsx
│   └── e2e/
│       ├── login.cy.ts
│       ├── jobs.cy.ts
│       └── applications.cy.ts
│
├── .env.example
├── .env.production
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Core Components Architecture

### A. Authentication Flow

```typescript
// types/auth.ts
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  resumeCount: number;
  applicationCount: number;
  createdAt: Date;
}

// services/api.ts
import axios from 'axios';
import { useDispatch } from 'react-redux';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        localStorage.setItem('accessToken', response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### B. State Management (Redux Slice Example)

```typescript
// store/slices/jobsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (filters: JobFilters) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  }
);

interface JobsState {
  items: Job[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  filters: JobFilters;
}

const initialState: JobsState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  filters: {},
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.jobs;
        state.total = action.payload.total;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default jobsSlice.reducer;
```

### C. Custom Hooks Pattern

```typescript
// hooks/useFetch.ts
export function useFetch<T>(
  url: string,
  options?: AxiosRequestConfig
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<T>(url, options);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Usage in component
function JobList() {
  const { data: jobs, loading } = useFetch<Job[]>('/jobs');
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {jobs?.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  );
}
```

---

## 4. Key Pages & Features

### Dashboard (Landing Page for Authenticated Users)

```typescript
// pages/Dashboard.tsx
export function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = useFetch('/analytics/summary');
  
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatisticsCard
          title="Total Applications"
          value={stats?.totalApplications}
          icon={<CheckCircle />}
          trend="+12% this week"
        />
        <StatisticsCard
          title="Interviews"
          value={stats?.interviews}
          icon={<MessageSquare />}
          trend="+2 this week"
        />
        <StatisticsCard
          title="Offers"
          value={stats?.offers}
          icon={<Trophy />}
        />
        <StatisticsCard
          title="Success Rate"
          value={`${stats?.successRate}%`}
          icon={<TrendingUp />}
        />
      </div>
      
      <RecentApplications />
      <RecommendedJobs />
    </DashboardLayout>
  );
}
```

### Jobs Page with Advanced Filtering

```typescript
// pages/Jobs.tsx
export function Jobs() {
  const dispatch = useDispatch();
  const { jobs, loading, filters } = useSelector(state => state.jobs);
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);

  useEffect(() => {
    dispatch(fetchJobs(filters));
  }, [filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1">
        <JobFilter
          filters={filters}
          onChange={setFilters}
          onSearch={(query) => setFilters({...filters, search: query})}
        />
      </div>
      
      {/* Job Listings */}
      <div className="lg:col-span-3">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <InfiniteScroll
            dataLength={jobs.length}
            next={() => dispatch(fetchJobs({...filters, page: page + 1}))}
            hasMore={jobs.length < total}
          >
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
```

### Resume Management

```typescript
// pages/Resume.tsx
export function Resume() {
  const { resumes } = useSelector(state => state.user);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Resumes</h1>
      
      {/* Upload Section */}
      <ResumeUpload onUploadSuccess={(resume) => {
        setSelectedResume(resume);
      }} />
      
      {/* Resume List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {resumes.map(resume => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            isSelected={selectedResume?.id === resume.id}
            onSelect={() => setSelectedResume(resume)}
            onDelete={() => deleteResume(resume.id)}
            onEdit={() => openEditor(resume)}
          />
        ))}
      </div>
      
      {/* AI Tailor Preview */}
      {selectedResume && <ResumeTailorPreview resume={selectedResume} />}
    </div>
  );
}
```

### Applications Tracker

```typescript
// pages/Applications.tsx
export function Applications() {
  const { applications } = useSelector(state => state.applications);
  const [filter, setFilter] = useState<ApplicationStatus>('all');

  const filtered = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      
      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'applied', 'interview', 'offer', 'rejected'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Applications List or Timeline */}
      <ApplicationsTable applications={filtered} />
    </div>
  );
}
```

---

## 5. Browser Extension Architecture

```typescript
// extension/manifest.json
{
  "manifest_version": 3,
  "name": "AI Career Agent Helper",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "tabs"
  ],
  "host_permissions": [
    "https://*.linkedin.com/*",
    "https://*.indeed.com/*",
    "https://*.glassdoor.com/*"
  ],
  "background": {
    "service_worker": "src/background.ts"
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/*"],
      "js": ["src/content.ts"]
    }
  ],
  "action": {
    "default_popup": "src/popup.html",
    "default_title": "AI Career Agent"
  }
}

// extension/src/content.ts
// Injected into job portal pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillApplicationForm') {
    // Auto-fill form with user's resume data + AI-tailored info
    fillForm(message.payload);
    sendResponse({ success: true });
  }
});

function fillForm(data: ApplicationFormData) {
  // Fill email
  const emailInput = document.querySelector('input[type="email"]');
  if (emailInput) (emailInput as HTMLInputElement).value = data.email;
  
  // Fill resume
  const resumeTextarea = document.querySelector('textarea[name="resume"]');
  if (resumeTextarea) (resumeTextarea as HTMLTextAreaElement).value = data.resume;
  
  // Fill other fields...
}
```

---

## 6. Responsive Design Strategy

```typescript
// Tailwind breakpoints in use
// xs: 0px
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Component example: Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Mobile-first approach
<div className="flex flex-col md:flex-row gap-4">
  <aside className="w-full md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

---

## 7. Error Handling & User Feedback

```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export function handleApiError(error: any): AppError {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data;
    
    return new AppError(
      errorData?.code || 'UNKNOWN_ERROR',
      errorData?.message || 'An error occurred',
      statusCode
    );
  }
  
  return new AppError('UNKNOWN_ERROR', 'An unexpected error occurred');
}

// Usage in components
function JobCard({ job }: { job: Job }) {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post(`/applications`, { jobId: job.id });
      showNotification('success', 'Application submitted successfully!');
    } catch (error) {
      const appError = handleApiError(error);
      showNotification('error', appError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{job.title}</h3>
      <button onClick={handleApply} disabled={loading}>
        {loading ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );
}
```

---

## 8. Performance Optimization

```typescript
// Code splitting with React.lazy
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Applications = lazy(() => import('./pages/Applications'));

// Route with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/jobs" element={<Jobs />} />
  </Routes>
</Suspense>

// Memoization for expensive components
export const JobCard = memo(({ job, onApply }: Props) => {
  return <div>...</div>;
}, (prevProps, nextProps) => {
  return prevProps.job.id === nextProps.job.id;
});

// useCallback for stable function references
const handleFilter = useCallback((filters: JobFilters) => {
  dispatch(setFilters(filters));
}, [dispatch]);
```

---

## 9. Testing Strategy

```typescript
// tests/components/__tests__/JobCard.test.tsx
import { render, screen } from '@testing-library/react';
import { JobCard } from '../JobCard';

describe('JobCard', () => {
  it('renders job title and company', () => {
    const job = { id: '1', title: 'Senior Dev', company: 'TechCorp' };
    render(<JobCard job={job} />);
    
    expect(screen.getByText('Senior Dev')).toBeInTheDocument();
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
  });

  it('calls onApply when apply button is clicked', async () => {
    const onApply = vi.fn();
    const job = { id: '1', title: 'Senior Dev', company: 'TechCorp' };
    
    render(<JobCard job={job} onApply={onApply} />);
    
    await userEvent.click(screen.getByText('Apply Now'));
    expect(onApply).toHaveBeenCalledWith(job.id);
  });
});
```

---

## 10. Deployment Checklist

- [ ] Environment variables configured (.env.production)
- [ ] API endpoints updated to production
- [ ] Authentication configured (OAuth, JWT)
- [ ] CDN setup for static assets
- [ ] Compression enabled (gzip)
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error logging setup (Sentry)
- [ ] Analytics setup (Mixpanel/PostHog)
- [ ] Performance monitoring (Datadog)
- [ ] PWA manifest configured
- [ ] Mobile responsiveness tested
- [ ] Browser compatibility verified
- [ ] Lighthouse score > 90
- [ ] Load testing completed

---

## 11. Frontend Tech Stack Summary

```json
{
  "core": {
    "react": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "vite": "^5.0.0"
  },
  "state": {
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "axios": "^1.6.0"
  },
  "ui": {
    "tailwindcss": "^3.0.0",
    "@headlessui/react": "^1.7.0",
    "lucide-react": "^0.0.0"
  },
  "forms": {
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0"
  },
  "components": {
    "recharts": "^2.0.0",
    "react-table": "^8.0.0",
    "react-markdown": "^9.0.0"
  },
  "dev": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "cypress": "^13.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

**This frontend architecture is production-ready and follows React best practices. Next: Backend Architecture →**
