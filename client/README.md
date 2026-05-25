# Frontend - AI Career Agent

React TypeScript frontend for automated job applications.

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── LoginForm.tsx        # Login page
│   │   ├── SignupForm.tsx       # Signup page
│   │   └── Dashboard.tsx        # Main dashboard
│   │
│   ├── services/
│   │   ├── api.ts               # Axios instance
│   │   ├── authService.ts       # Auth API calls
│   │   ├── jobService.ts        # Job API calls
│   │   └── applicationService.ts # Application API calls
│   │
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind styles
│
├── index.html                   # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
├── postcss.config.js           # PostCSS config
├── .env.local                  # Environment variables
├── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## 🔗 Backend Connection

The frontend connects to backend at:
```
http://localhost:5000/api/v1
```

Make sure backend is running on port 5000!

## 📡 API Integration

### Authentication
- `authService.signup()` - Register new user
- `authService.login()` - User login
- `authService.logout()` - Logout user
- `authService.getProfile()` - Get user profile

### Jobs
- `jobService.searchJobs()` - Search jobs with filters
- `jobService.getJob()` - Get job details

### Applications
- `applicationService.applyToJob()` - Apply to a job
- `applicationService.getUserApplications()` - Get all applications
- `applicationService.updateStatus()` - Update application status
- `applicationService.getStats()` - Get application statistics

## 🎨 UI Components

- **LoginForm** - User login page
- **SignupForm** - User registration page
- **Dashboard** - Main dashboard with stats

## 🔐 Authentication

Access tokens are stored in `localStorage`:
- `accessToken` - Used for API calls
- `refreshToken` - Used to get new tokens

Token is automatically added to all API requests via interceptor.

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

Builds to `dist/` folder.

## 🆘 Troubleshooting

**Cannot connect to backend:**
- Ensure backend is running on `http://localhost:5000`
- Check `.env.local` has correct `VITE_API_URL`

**CORS errors:**
- Backend must have CORS enabled for `http://localhost:5173`

**Port already in use:**
- Vite will automatically use a different port if 5173 is taken

---

**Next Steps:** Start backend with `npm run dev` in server folder, then navigate to `http://localhost:5173` in browser!
