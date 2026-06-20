import dotenv from 'dotenv';

dotenv.config();

export type EnvConfig = {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    frontendUrl: string;
    geminiApiKey: string | null;
    groqApiKey: string | null;
    aiEnabled: boolean;
};

let cached: EnvConfig | null = null;

export function getEnv(): EnvConfig {
    if (cached) return cached;

    const nodeEnv = process.env.NODE_ENV || 'development';
    const databaseUrl = process.env.DATABASE_URL || '';
    const jwtSecret = process.env.JWT_SECRET || '';

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required');
    }

    if (!jwtSecret) {
        throw new Error('JWT_SECRET is required');
    }

    if (nodeEnv === 'production' && jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
    }

    const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || null;
    const groqApiKey = process.env.GROQ_API_KEY?.trim() || null;

    cached = {
        port: Number(process.env.PORT) || 5000,
        nodeEnv,
        databaseUrl,
        jwtSecret,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        geminiApiKey,
        groqApiKey,
        aiEnabled: Boolean(geminiApiKey || groqApiKey),
    };

    return cached;
}

export function isAIConfigured(): boolean {
    return getEnv().aiEnabled;
}
