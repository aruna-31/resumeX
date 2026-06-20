# IntelliATS - Local Setup Guide

## Prerequisites
- **Node.js**: v18+
- **PostgreSQL**: v14+ running locally or via Docker.
- **Git**

## 1. Clone & Install
```bash
git clone <repo-url>
cd IntelliATS
npm run install-all  
# This installs root, frontend, and backend dependencies
```

## 2. Database Setup
1. Ensure PostgreSQL is running.
2. Create a database named `intelliats_db`.
3. Configure `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgres://postgres:password@localhost:5432/intelliats_db
   JWT_SECRET=dev_secret_key_123
   ```

## 3. Environment Variables
**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 4. Startup
Run both servers concurrently:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## Common Errors
- **"Client does not exist" (Postgres)**: Ensure the database is created (`createdb intelliats_db`).
- **CORS Error**: Verify `backend/src/app.ts` has `cors` enabled and origin matching frontend.
- **Port in use**: Kill processes on 5000/5173 or change `.env`.
