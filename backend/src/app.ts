/**
 * Express Application — Production Configuration
 * PostgreSQL + Sequelize, JWT auth (HR / CANDIDATE roles).
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/database';
import './models';
import { getEnv } from './config/env';

// Import routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import hrRoutes from './routes/hr';
import parserRoutes from './routes/parser';
import resumeRoutes from './routes/resumes';
import aiRoutes from './routes/ai';
import analysisRoutes from './routes/analysis';
import applicationRoutes from './routes/applications';
import stripeRoutes from './routes/stripe';

export function createApp() {
    const app = express();

    // =======================
    // Security Middleware
    // =======================

    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));

    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }));

    // Body parsing
    app.use(express.json({
        limit: '5mb',
        verify: (req: any, _res, buf) => {
            req.rawBody = buf;
        }
    }));
    app.use(express.urlencoded({ extended: true, limit: '5mb' }));

    // Global rate limiter (per IP)
    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'rate_limited', message: 'Too many requests. Please try again in 15 minutes.' },
    });

    // Stricter limiter for auth endpoints (prevent brute force)
    const authLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20,
        message: { error: 'rate_limited', message: 'Too many auth attempts. Please try again in 1 hour.' },
    });

    app.use('/api', globalLimiter);
    app.use('/api/auth', authLimiter);

    // =======================
    // Health Check
    // =======================

    app.get('/health', async (_req: Request, res: Response) => {
        let dbStatus: 'up' | 'down' = 'down';
        try {
            await sequelize.authenticate();
            dbStatus = 'up';
        } catch {
            dbStatus = 'down';
        }

        const env = getEnv();
        const ok = dbStatus === 'up';
        res.status(ok ? 200 : 503).json({
            status: ok ? 'ok' : 'degraded',
            service: 'ResumeX API',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            environment: env.nodeEnv,
            checks: {
                database: dbStatus,
                ai: env.aiEnabled ? 'configured' : 'disabled',
            },
        });
    });

    // =======================
    // API Routes
    // =======================

    const apiRouter = express.Router();

    apiRouter.use('/auth', authRoutes);
    apiRouter.use('/jobs', jobRoutes);
    apiRouter.use('/hr', hrRoutes);
    apiRouter.use('/applications', applicationRoutes);
    apiRouter.use('/parser', parserRoutes);
    apiRouter.use('/resumes', resumeRoutes);
    apiRouter.use('/ai', aiRoutes);
    apiRouter.use('/analysis', analysisRoutes);
    apiRouter.use('/stripe', stripeRoutes);

    app.use('/api', apiRouter);

    // Root
    app.get('/', (_req: Request, res: Response) => {
        res.status(200).json({
            name: 'ResumeX API',
            version: '2.0.0',
            description: 'AI-Powered ATS & Resume Intelligence Platform',
            docs: '/api/docs',
        });
    });

    // 404 Handler
    app.use((_req: Request, res: Response) => {
        res.status(404).json({ error: 'not_found', message: 'Route not found.' });
    });

    // Global Error Handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const statusCode = err.status || err.statusCode || 500;
        const isDev = process.env.NODE_ENV !== 'production';

        console.error('[Server Error]', err.message, isDev ? err.stack : '');

        // CORS errors
        if (err.message === 'Not allowed by CORS') {
            return res.status(403).json({ error: 'cors_error', message: 'CORS policy violation.' });
        }

        res.status(statusCode).json({
            error: 'server_error',
            message: isDev ? err.message : 'Internal Server Error',
            ...(isDev && { stack: err.stack }),
        });
    });

    return app;
}

export const app = createApp();
export default app;
