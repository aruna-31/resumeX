# IntelliATS API Specification (v1)

## 1. Authentication
- `POST /api/auth/register`
    - Body: `{ email, password, role: 'HR' | 'CANDIDATE', fullName }`
    - Response: `{ token, user: { id, email, role } }`
- `POST /api/auth/login`
    - Body: `{ email, password }`
    - Response: `{ token, user }`
- `GET /api/auth/me`
    - Header: `Authorization: Bearer <token>`
    - Response: `{ user }`

## 2. Role Templates (Admin/HR)
- `GET /api/roles`
    - Query: `?search=Software`
    - Response: `[{ id, title, defaultSkills[], defaultExp }]`
- `POST /api/roles` (Admin only)
    - Body: `{ title, skills, description }`

## 3. Jobs (ATS Core)
- `POST /api/jobs`
    - Body: `{ title, description, requirements: { skills, minExp }, location, type }`
    - Response: `{ id, atsJobId: 'JOB-1234', ... }`
- `GET /api/jobs`
    - Query: `?status=OPEN&page=1`
    - Response: `{ data: [Job], total, page }`
- `GET /api/jobs/:id`
    - Response: `{ Job, analytics: { applicantCount } }`
- `PUT /api/jobs/:id/status`
    - Body: `{ status: 'CLOSED' | 'ARCHIVED' }`

## 4. Applications (Candidate)
- `POST /api/jobs/:id/apply`
    - Body: `FormData` (file: resume.pdf)
    - Process: Uploads file -> Triggers Parsing -> Calculates Score -> Saves Application.
    - Response: `{ applicationId, matchScore, missingSkills[] }`
- `GET /api/my-applications`
    - Response: `[{ jobTitle, status, appliedAt }]`

## 5. Candidate Management (HR)
- `GET /api/jobs/:id/candidates`
    - Query: `?minScore=80&sort=score_desc`
    - Response: `[{ candidateId, name, matchScore, summary, highlights }]`
- `GET /api/applications/:id/analysis`
    - Response: `{ detailedAnalysis, structuredResumeData }`
- `POST /api/applications/:id/shortlist`
    - Body: `{ note }`
    - Response: `{ status: 'SHORTLISTED', emailSent: true }`

---

## Database Schema (PostgreSQL)

### 1. Users & Auth
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('HR', 'CANDIDATE', 'ADMIN')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Role Templates
```sql
CREATE TABLE role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) UNIQUE NOT NULL, -- e.g. "Frontend Developer"
  default_skills TEXT[], -- Array of strings
  description TEXT
);
```

### 3. Jobs (ATS Core)
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hr_id UUID REFERENCES users(id),
  ats_job_id VARCHAR(20) UNIQUE NOT NULL, -- "JOB-2024-001"
  title VARCHAR(100) NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '{}', -- { "skills": ["React"], "minExp": 2 }
  status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, CLOSED, DRAFT
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_jobs_hr ON jobs(hr_id);
CREATE INDEX idx_jobs_status ON jobs(status);
```

### 4. Applications & Resumes
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID REFERENCES users(id),
  resume_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'APPLIED', -- APPLIED, SHORTLISTED, REJECTED, HIRED
  
  -- AI Analysis Fields
  parsed_data JSONB, -- The structured resume
  match_score INTEGER, -- 0-100
  ai_analysis_summary TEXT, -- "Good fit but lacks AWS"
  missing_skills TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);
CREATE INDEX idx_appl_job_score ON applications(job_id, match_score DESC);
```

### 5. Audit Logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50), -- "JOB_CREATED", "CANDIDATE_SHORTLISTED"
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Repository Structure (Monorepo-lite)

```text
/
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # UI Kit
│   │   ├── pages/        # Route views
│   │   ├── services/     # API Client
│   │   └── types/        # (Symlinked or copied types)
│   └── package.json
│
├── backend/              # Node + Express
│   ├── src/
│   │   ├── config/       # DB & AI Config
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Sequelize definitions
│   │   ├── services/     # Business Logic (AI, Ranking)
│   │   └── types/        # Shared DTOs
│   └── package.json
│
├── shared/               # Shared Types & Constants
│   ├── index.ts          # Export all interfaces
│   └── api-types.ts      # Request/Response DTOs
│
├── package.json          # Root scripts
└── README.md
```
