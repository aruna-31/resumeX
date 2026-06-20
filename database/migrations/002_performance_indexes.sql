-- Migration 002: Performance Indexes for application listing and job searching

CREATE INDEX IF NOT EXISTS idx_applications_match_score ON applications (match_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs (title);
