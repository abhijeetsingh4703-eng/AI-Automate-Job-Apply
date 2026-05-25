# 🚀 Quick Start - Build Today (Day 1)
**Get your AI Career Agent running in the next 2-3 hours**

---

## STEP 1: MongoDB Atlas Setup (5 minutes)

### Create Free Cluster

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Click **"Sign Up"** (free tier)
3. Create account with email
4. Create organization & project
5. Click **"Create Deployment"**
   - Select **Free Tier**
   - Region: US East (or closest to you)
   - Cluster name: `career-agent-dev`
   - Click **Create Deployment**

### Get Connection String

6. Wait 5-10 minutes for cluster to be ready
7. Click **"Connect"**
8. Choose **"Drivers"** → **Node.js**
9. Copy connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
   ```
10. Replace:
    - `username` with: `dev`
    - `password` with: `Dev123456` (or your choice)
    - `myFirstDatabase` with: `career-agent`

**Your MongoDB URL should look like:**
```
mongodb+srv://dev:Dev123456@cluster0.xxxxx.mongodb.net/career-agent?retryWrites=true&w=majority
```

✅ **MongoDB Ready!** Keep this connection string - you'll need it next.

---

## STEP 2: Project Setup (10 minutes)

### Clone Repository & Initialize

```bash
# Navigate to your project folder
cd f:/automate-job-apply

# Create main folders
mkdir -p frontend backend docs public

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# Create .gitignore
cat > .gitignore << 'EOF'
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/

# Redis
dump.rdb
EOF

git add .gitignore
git commit -m "chore: initial project setup"
```

### Setup Backend (Foundation Only - We'll Focus on Frontend)

```bash
cd backend

# Initialize Node project
npm init -y

# Install essential dependencies (we'll add more later)
npm install express mongoose cors dotenv
npm install -D typescript @types/express @types/node nodemon

# Create basic structure
mkdir -p src/{models,controllers,routes,middleware,config}
touch src/app.ts src/server.ts .env

cd ..
```

### Setup Frontend (Where We'll Start Coding)

```bash
cd frontend

# Create React + TypeScript project with Vite
npm create vite@latest . -- --template react-ts

# Accept prompts (press 'y' for all)

# Install dependencies
npm install

# Install additional libraries
npm install -D tailwindcss postcss autoprefixer
npm install axios react-router-dom @reduxjs/toolkit react-redux

# Initialize Tailwind
npx tailwindcss init -p

# Create environment file
touch .env.local

cd ..
```

✅ **Project structure ready!**

---

## STEP 3: Environment Configuration (5 minutes)

### Backend .env

```bash
cd backend

cat > .env << 'EOF'
# Node Environment
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://dev:dev123@career-agent-dev.7bbaz1m.mongodb.net/career-agent?retryWrites=true&w=majority

# JWT (Generate random strings)
JWT_SECRET=your_random_jwt_secret_key_12345
JWT_REFRESH_SECRET=your_random_refresh_secret_key_12345

# API
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# OpenAI (Add later when you need AI)
# OPENAI_API_KEY=sk-...
EOF

# ⚠️  IMPORTANT: Replace MONGODB_URI with YOUR connection string from Step 1!

cd ..
```

### Frontend .env.local

```bash
cd frontend

cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000
EOF

cd ..
```

---

## STEP 4: Start Building the Frontend (NOW!)

### Update Tailwind Config

Open `frontend/tailwind.config.js` and replace with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      }
    },
  },
  plugins: [],
}
```

### Create Global Styles

Open `frontend/src/index.css` and replace with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

### Create API Service

Create `frontend/src/services/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Create Auth Service

Create `frontend/src/services/authService.ts`:

```typescript
import api from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/v1/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/v1/auth/login', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};
```

### Create Login Component

Create `frontend/src/components/LoginForm.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          AI Career Agent
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Create Signup Component

Create `frontend/src/components/SignupForm.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.signup(formData);
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Get Started
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password (min 8 chars)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Create Router Setup

Update `frontend/src/App.tsx`:

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { authService } from './services/authService';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to AI Career Agent</h1>
      <p className="text-gray-600 mb-8">Dashboard coming soon...</p>
      
      <button
        onClick={() => {
          authService.logout();
          window.location.href = '/login';
        }}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## STEP 5: Start the Frontend Server

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ **Frontend is running!** Open http://localhost:5173 in your browser.

---

## STEP 6: What You'll See Now

- ✅ Login page (Tailwind styled)
- ✅ Signup page
- ✅ Protected dashboard route
- ✅ Logout functionality

**Note:** Login/signup won't work yet because we haven't built the backend. That's next!

---

## STEP 7: Build the Backend Auth API (Optional - Start Here Tomorrow)

When ready, follow [BACKEND_ARCHITECTURE.md](../BACKEND_ARCHITECTURE.md) to:

1. Create User model
2. Create auth controller
3. Create auth routes
4. Test with Postman

---

## 📋 Your First Day Checklist

- ✅ MongoDB Atlas account created
- ✅ Connection string saved (in .env)
- ✅ Frontend project initialized
- ✅ Login/Signup pages built
- ✅ Frontend running on http://localhost:5173
- ⬜ Backend auth API (tomorrow)
- ⬜ Connect frontend to backend
- ⬜ User can actually sign up and login

---

## 🎯 Git Commit (You've Earned This!)

```bash
cd f:/automate-job-apply

git add -A
git commit -m "feat: initialize frontend with login and signup pages"
git log --oneline
```

You should see 2 commits:
```
abc1234 feat: initialize frontend with login and signup pages
def5678 chore: initial project setup
```

---

## 📚 Next Steps (When You're Ready)

1. **Backend Auth** → [BACKEND_ARCHITECTURE.md](../BACKEND_ARCHITECTURE.md#a-authentication-service)
2. **Connect Frontend to Backend** → Use the API service you created
3. **Add Resume Upload** → [FRONTEND_ARCHITECTURE.md](../FRONTEND_ARCHITECTURE.md)
4. **Add Job Search** → Same approach as Resume

---

## ⏰ Time Summary

- MongoDB Setup: 5 min
- Project Setup: 10 min
- Frontend Code: 45 min
- **Total Time to First UI: 1 hour** ✅

---

## 🚀 You're Now Building!

**Congratulations!** You have:
- ✅ Professional project structure
- ✅ Working frontend UI
- ✅ API integration setup
- ✅ Auth pages built
- ✅ Git tracking

**Next session:** Build the backend and connect them together.

---

**Questions?** Refer back to the main architecture documents in the parent folder.

**Ready to code?** Open `frontend/src` and start building! 💻
