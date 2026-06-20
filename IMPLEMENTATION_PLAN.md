# IntelliATS Implementation Plan

## 1. MVP Scope & Core Flows

### MVP Scope (Hackathon Focused)
**Must-Have (Core):**
- **Auth:** Candidate & HR Login/Signup (JWT).
- **HR Dashboard:** Create Jobs (Job ID generation), detailed view of applicants per job.
- **Candidate Experience:** View Job details, Apply (Upload Resume + Parse), "Am I a fit?" analyzer.
- **ATS Engine:** Resume Parsing (extract skills/exp), Ranking Algorithm (based on job reqs), "Why this rank?" explanation.
- **Database:** robust schema for Jobs, Users, Applications.

**Nice-to-Have (Post-MVP/If Time Permits):**
- Bulk Upload for HR.
- Advanced Resume Builder with drag-and-drop.
- Automated Email notifications (can mock this for MVP).
- Social OAuth.

### User Flows
**Candidate Flow:**
1. Landing Page -> View Open Jobs.
2. Select Job -> Upload Resume.
3. **AI Analysis:** System parses resume -> shows "Match Score" & "Missing Skills" feedback immediately.
4. "Apply" -> Application saved.

**HR Flow:**
1. Login -> Dashboard (List of Jobs).
2. "Create Job" -> Input Title, Description, Required Skills, Min Experience.
3. View Job -> List of Candidates sorted by Rank.
4. Expand Candidate -> View Resume Summary + AI Explanation ("Ranked #1 because...").

### Edge Cases
- **Duplicate Applications:** Candidate applies to the same job twice (prevent or update).
- **Parsing Failures:** Resume is an image or unreadable PDF (fallback to manual entry or error).
- **Empty/Junk Uploads:** User uploads a non-resume file.
- **Zero Matches:** No candidates meet minimum requirements (handling empty states gracefully).

### Core Data Entities
- **User:** (ID, Email, Role [HR/Candidate], PasswordHash)
- **Job:** (ID, HR_ID, Title, Description, Requirements (JSON), Status)
- **Profile/Resume:** (User_ID, Skills[], Experience, Education, RawFileUrl)
- **Application:** (Job_ID, User_ID, Status, MatchScore, AI_Analysis_Summary)

---

## 2. System Architecture

### Full-Stack Architecture Map

```ascii
[Client Side]                          [Server Side]
+--------------------------+          +------------------------+
|   React + Vite (TS)      |          |    Node.js + Express   |
|                          |   HTTP   |       (TypeScript)     |
|  - Candidate Portal      |<-------->|                        |
|  - HR Dashboard          |   REST   |  [ API Routes ]        |
|  - Resume Builder UI     |          |  /auth, /jobs, /appls  |
|                          |          |                        |
+-----------+--------------+          +-----------+------------+
            |                                     |
            v                                     v
   [ AI / ML Service ]*              [ PostgreSQL Database ]
   (OpenAI / Local LLM)              (Users, Jobs, Applications)
   *Called via Backend               (Supabase or Render PG)
```

### Frontend Architecture (React + Vite)
- **Pages:**
    - `/` : Landing Page
    - `/auth/login` & `/auth/signup`
    - `/dashboard` (HR: Job List, Candidate: My Applications)
    - `/jobs/:id` (Job Details & Apply)
    - `/jobs/:id/applicants` (HR: Ranked List)
    - `/resume-builder` (Candidate Tool)
- **Components:**
    - `JobCard`, `CandidateRow` (with score badge), `ResumeUploader`, `AnalysisModal`.
- **State:** React Context or Zustand for Auth & Global UI state.

### Backend Architecture (Node.js + Express)
- **Services:**
    - `AuthService`: JWT handling.
    - `JobService`: CRUD for jobs.
    - `ApplicationService`: Handling applies, status updates.
    - `RankingService`: The "Brain". Takes Jd + Resume -> Returns Score + Explanation.
    - `FileService`: Uploads to S3/Supabase Storage (or local tmp for MVP).
- **Routes:**
    - `POST /api/auth/*`
    - `GET/POST /api/jobs`
    - `POST /api/jobs/:id/apply`
    - `GET /api/jobs/:id/candidates` (Sorted by score)

### Database Schema (PostgreSQL)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('HR', 'CANDIDATE', 'ADMIN'))
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hr_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB, -- store specific skills/exp requirements
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID REFERENCES users(id),
  resume_url TEXT,
  parsed_data JSONB, -- cached parsed resume
  match_score INT, -- 0 to 100
  ai_explanation TEXT,
  status TEXT DEFAULT 'APPLIED',
  UNIQUE(job_id, candidate_id)
);
```

### Explainable AI & Ranking Logic
- **Input:** Parsed Resume Text + Job Description.
- **Process:**
    1. Extract keywords/skills from both.
    2. Semantic similarity check (Vector embedding or LLM comparison).
    3. Rule-based check (Years of exp > Req exp?).
- **Output:** Score (0-100) + "Why": "Matches 8/10 skills, missing 'Docker'".

### Infrastructure
- **Frontend Host:** Vercel
- **Backend Host:** Render
- **Database:** Supabase (Postgres)
