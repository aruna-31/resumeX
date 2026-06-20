-- Database init for ResumeX (Docker entrypoint)
-- Keep this minimal and safe to re-run.

-- Required for gen_random_uuid() if any schema uses it
CREATE EXTENSION IF NOT EXISTS pgcrypto;