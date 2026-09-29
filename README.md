# ResumeX — AI Resume Intelligence Platform

> AI-powered resume analysis and candidate screening platform combining semantic matching, ATS-oriented analysis, and full-stack application workflows.

## What is ResumeX?

ResumeX is designed around two user groups:

- **Candidates** — analyze resumes, identify skill gaps, improve role alignment, generate supporting content, and prepare for interviews.
- **HR teams** — manage jobs, screen resumes, compare candidate profiles, and use semantic matching to support recruitment workflows.

## Core capabilities

### Candidate side
- AI-assisted ATS analysis
- Resume optimization and rewriting
- Cover-letter generation
- Interview preparation
- Skill-gap analysis
- Career-oriented recommendations
- Job matching

### HR side
- Job management
- Candidate screening
- Semantic candidate ranking
- Hiring insights
- Bulk resume processing

## Architecture

```
React + Vite + TypeScript
          |
       HTTP/API
          v
Node.js + Express
          |
     PostgreSQL
          |
    AI Manager Layer
     /          \
  Gemini        Groq
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Sequelize |
| Authentication | JWT + bcrypt |
| AI | Google Gemini + Groq fallback |
| Validation | Zod |
| Payments | Stripe |
| Deployment | Vercel + Railway/Render |
| CI/CD | GitHub Actions |

## Engineering highlights

- Candidate and HR workflows in one application
- Server-side AI integration
- Role-aware authentication and authorization
- Database constraints and validation
- AI provider fallback architecture
- Quota/rate-control concepts
- API and schema documentation

## Run locally

Install dependencies in the root, backend, and frontend as defined by the repository structure. Configure PostgreSQL and required AI credentials locally.

Never commit secrets.

## Documentation

- [Setup guide](SETUP_GUIDE.md)
- [API and schema](API_AND_SCHEMA.md)
- [Documentation](docs/)

## Author

**Lavanuru Aruna** · https://github.com/aruna-31
