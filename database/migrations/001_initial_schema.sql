-- ResumeX initial schema (Sequelize-aligned)
-- Idempotent: safe to run multiple times

--CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    role            VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE'
                    CHECK (role IN ('HR', 'CANDIDATE', 'ADMIN')),
    plan            VARCHAR(20) NOT NULL DEFAULT 'FREE'
                    CHECK (plan IN ('FREE', 'PREMIUM', 'ENTERPRISE')),
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- =============================================================================
-- JOBS
-- =============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ats_job_id      VARCHAR(255) NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    requirements    JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'CLOSED', 'ARCHIVED')),
    location        VARCHAR(255),
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_hr_id ON jobs (hr_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);

-- =============================================================================
-- APPLICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url      TEXT NOT NULL,
    parsed_data     JSONB NOT NULL DEFAULT '{}',
    match_score     INTEGER NOT NULL DEFAULT 0,
    ai_explanation  TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'APPLIED'
                    CHECK (status IN ('APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED')),
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications (candidate_id);

-- =============================================================================
-- RESUMES
-- =============================================================================
CREATE TABLE IF NOT EXISTS resumes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    "templateId"    VARCHAR(255) NOT NULL,
    content         JSONB NOT NULL,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes ("userId");

-- =============================================================================
-- RESUME VERSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS resume_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "resumeId"      UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    content         JSONB NOT NULL,
    "changeSummary" VARCHAR(255),
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions ("resumeId");

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(255) NOT NULL,
    entity_id       VARCHAR(255),
    details         JSONB NOT NULL DEFAULT '{}',
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
