# ResumeX — AI-Powered ATS & Resume Intelligence Platform

<div align="center">

![ResumeX Banner](https://img.shields.io/badge/ResumeX-AI_SaaS_Platform-blue?style=for-the-badge&logo=firebase)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)](https://railway.app/)

**A production-grade AI SaaS platform that automates resume analysis, ATS optimization, and candidate screening using Gemini 2.0 Flash.**

[Live Demo](https://resumex.vercel.app) · [Documentation](./docs) · [API Reference](./API_AND_SCHEMA.md)

</div>

---

## 🚀 What Is ResumeX?

ResumeX is a dual-portal AI hiring platform built for both **candidates** and **HR teams**:

- **Candidates** upload resumes, get AI-powered ATS scores, optimize for specific roles, generate cover letters, and prepare for interviews
- **HR Teams** post jobs, screen hundreds of resumes semantically, rank candidates by AI fit score, and get actionable hiring insights

Built to handle **10,000+ users** with Firebase scalability, per-user AI quota management, and a multi-provider AI failover system.

---

## ✨ Key Features

### Candidate Portal
| Feature | Description |
|---|---|
| 🧠 AI ATS Scorer | Get a detailed 6-dimension ATS compatibility score |
| ⚡ ATS Optimizer | AI rewrites your resume sections for specific jobs |
| ✍️ Resume Rewriter | Transforms raw text into structured, ATS-optimized resumes |
| 📝 Cover Letter Generator | Personalized, role-specific cover letters in seconds |
| 🎯 Interview Prep | AI-generated technical + behavioral + system design questions |
| 📊 Skill Gap Analyzer | Identifies exact gaps and builds your learning path |
| 🗺️ Career Recommender | AI-driven career trajectory and role recommendations |
| 🔮 Job Match Predictor | Score-based match prediction before applying |

### HR Portal
| Feature | Description |
|---|---|
| 🏆 Candidate Ranking | Semantic AI ranking of all applicants, not keyword matching |
| 📈 Hiring Insights | AI-generated analytics on your talent pool |
| 🔍 Bulk Screening | Process 100+ resumes with AI semantic evaluation |
| 📋 Job Management | Create, manage, and track job postings |

---

## 🏗️ Architecture

```
Frontend (React + Vite + TypeScript)     Backend (Node.js + Express + TypeScript)
         │                                         │
         │ Custom JWT Header                       │
         ├────────────────────────────────────────▶│
         │                                         │
         │                               ┌─────────┴──────────┐
         │                               │   JSON Web Token   │
         │                               └──────────┬──────────┘
         │                                          │
         │                               ┌──────────▼──────────┐
         │                               │    PostgreSQL DB    │
         │                               │  (Sequelize ORM)    │
         │                               └──────────────────────┘
         │
         │                               ┌──────────────────────┐
         │                               │   AI Manager Layer    │
         │                               │ Primary: Gemini Flash │
         │                               │ Fallback: Groq        │
         │                               └──────────────────────┘
         │
    Custom Auth ◀───────────────────────── Custom JWT Auth
    Multer Memory                         PostgreSQL Storage
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion |
| **State** | TanStack Query v5, Zustand |
| **Auth** | Custom JSON Web Token (JWT) with bcrypt password hashing |
| **Database** | PostgreSQL (Sequelize ORM) |
| **Storage** | In-Memory processing (PDF/DOCX extraction via Multer) |
| **Backend** | Node.js, Express, TypeScript |
| **AI Primary** | Google Gemini 2.0 Flash |
| **AI Fallback** | Groq (Llama 3.1 8B) |
| **Payments** | Stripe |
| **Deployment** | Vercel (frontend) + Railway (backend) |
| **CI/CD** | GitHub Actions |

---

## 🔒 Security

- **Custom JWT Auth** — Standard JSON Web Token authorization validation headers
- **Server-side AI** — Gemini API key never exposed to browser
- **Per-user quota** — Free: 5 AI requests/24h, Premium: 50/h
- **Database Constraints** — Foreign keys and unique keys enforced at PostgreSQL level
- **Zod Validation** — All API inputs validated with runtime schemas
- **Helmet** — HTTP security headers
- **Rate Limiting** — IP-based (200/15min global, 20/hr for auth)
- **Audit Logging** — AI operations logged to PostgreSQL audit logs table

---

## 💰 Subscription Plans

| Feature | Free | Premium ($9.99/mo) | Enterprise ($29.99/mo) |
|---|---|---|---|
| AI Requests | 5 / 12 hours | 50 / hour | 200 / hour |
| ATS Scoring | ✅ | ✅ | ✅ |
| Cover Letter | ✅ | ✅ | ✅ |
| Interview Prep | ✅ | ✅ | ✅ |
| Skill Gap Analysis | ❌ | ✅ | ✅ |
| Career Recommendations | ❌ | ✅ | ✅ |
| Bulk HR Screening | ❌ | ❌ | ✅ |
| Priority Queue | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Firebase project ([setup guide](./SETUP_GUIDE.md))
- Gemini API key ([get one free](https://aistudio.google.com))

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/resumeX.git
cd resumeX

# Install root deps
npm install

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend (`backend/.env`):**
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

**Frontend (`frontend/.env`):**
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_URL=http://localhost:5000
```

### 3. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and select project
firebase login
firebase use your-project-id

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 4. Run Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## 📦 Deployment

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```

### Backend → Railway
```bash
cd backend
railway up
```

Set the following environment variables in Railway/Vercel dashboards (never commit secrets!).

---

## 📐 AI Cost Estimation

| Scale | Users | Daily AI Calls | Monthly Cost |
|---|---|---|---|
| MVP | 100 | 50 | ~$3 |
| Growth | 1,000 | 500 | ~$30 |
| Scale | 10,000 | 2,000 | ~$120 |
| Enterprise | 100,000 | 10,000 | ~$600 |

*Optimizations: 24h response caching, prompt compression, free tier uses cheaper model*

---

## 🧪 Testing
```bash
# Backend type check
cd backend && npx tsc --noEmit

# Frontend type check + build
cd frontend && npm run build
```

---

## 📋 Recruiter Summary

> **ResumeX** is a production-deployed, AI-powered hiring SaaS built with React, Node.js, Firebase, and Google Gemini. It features a dual-portal architecture (candidate + HR), 10 distinct AI features, enterprise-grade security with per-user quota enforcement, Stripe payment integration, and a CI/CD pipeline to Vercel + Railway. Designed to handle 10k+ concurrent users with Firestore auto-scaling, multi-provider AI failover (Gemini → Groq), and response caching to minimize API costs.

---

## 📄 License

MIT License — See [LICENSE](./LICENSE)

---

<div align="center">
Built with ❤️ using Firebase, Gemini AI, and React
</div>
