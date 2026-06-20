import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import * as crypto from 'crypto';
import AuditLog from '../models/AuditLog';
import { isAIConfigured } from '../config/env';

dotenv.config();

export type AIProvider = 'gemini' | 'groq';
export type AIFeatureType =
    | 'ATS_SCORE'
    | 'ATS_OPTIMIZE'
    | 'RESUME_REWRITE'
    | 'COVER_LETTER'
    | 'INTERVIEW_QUESTIONS'
    | 'SKILL_GAP'
    | 'CAREER_RECOMMENDATION'
    | 'JOB_MATCH'
    | 'CANDIDATE_RANK'
    | 'HIRING_INSIGHTS'
    | 'PARSE_RESUME'
    | 'ROLE_PROFILE'
    | 'SEMANTIC_EVAL';

export interface AIRequest {
    prompt: string;
    feature: AIFeatureType;
    userId?: string;
    useCache?: boolean;
    maxRetries?: number;
    temperature?: number;
    parseJSON?: boolean;
}

export interface AIResponse<T = any> {
    success: boolean;
    data: T | null;
    provider: AIProvider;
    model: string;
    latencyMs: number;
    cached: boolean;
    tokensEstimate: number;
    costEstimateUsd: number;
    error?: string;
}

const COST_PER_1M_TOKENS: Record<string, number> = {
    'gemini-2.0-flash': 0.075,
    'llama-3.1-8b-instant': 0.02,
    'mixtral-8x7b-32768': 0.27,
};

function estimateCost(tokens: number, model: string): number {
    const rate = COST_PER_1M_TOKENS[model] ?? 0.1;
    return (tokens / 1_000_000) * rate;
}

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// Memory cache for simplicity instead of Firestore
const memoryCache = new Map<string, { result: any, expiresAt: number }>();
const CACHE_TTL_HOURS = 24;

function getCacheKey(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16);
}

async function getCachedResponse(prompt: string): Promise<any | null> {
    const key = getCacheKey(prompt);
    const cached = memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
        memoryCache.delete(key);
        return null;
    }
    return cached.result;
}

async function setCachedResponse(prompt: string, result: any, model: string): Promise<void> {
    const key = getCacheKey(prompt);
    memoryCache.set(key, {
        result,
        expiresAt: Date.now() + CACHE_TTL_HOURS * 3600000
    });
}

let geminiAI: GoogleGenerativeAI | null = null;
let groqClient: Groq | null = null;

function getGeminiModel(temperature = 0.2): GenerativeModel {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    if (!geminiAI) geminiAI = new GoogleGenerativeAI(apiKey);

    return geminiAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature,
        },
    });
}

function getGroqClient(): Groq {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not configured');

    if (!groqClient) groqClient = new Groq({ apiKey });
    return groqClient;
}

export function extractJSON(text: string): any {
    try {
        return JSON.parse(text);
    } catch {
        const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlock) {
            try { return JSON.parse(codeBlock[1]); } catch { }
        }
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try { return JSON.parse(match[0]); } catch { }
        }
        return null;
    }
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function callAI<T = any>(req: AIRequest): Promise<AIResponse<T>> {
    const {
        prompt,
        feature,
        userId,
        useCache = true,
        maxRetries = 3,
        temperature = 0.2,
        parseJSON = true,
    } = req;

    const start = Date.now();
    const primaryModel = 'gemini-2.0-flash';
    const fallbackModel = 'llama-3.1-8b-instant';

    if (!isAIConfigured()) {
        return {
            success: false,
            data: null,
            provider: 'gemini',
            model: primaryModel,
            latencyMs: Date.now() - start,
            cached: false,
            tokensEstimate: 0,
            costEstimateUsd: 0,
            error: 'AI not configured. Set GEMINI_API_KEY and/or GROQ_API_KEY.',
        };
    }

    if (useCache) {
        const cached = await getCachedResponse(prompt);
        if (cached) {
            return {
                success: true,
                data: cached as T,
                provider: 'gemini',
                model: primaryModel,
                latencyMs: Date.now() - start,
                cached: true,
                tokensEstimate: 0,
                costEstimateUsd: 0,
            };
        }
    }

    let lastError = '';
    let usedProvider: AIProvider = 'gemini';
    let usedModel = primaryModel;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const model = getGeminiModel(temperature);
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            if (!text) throw new Error('Empty response from Gemini');

            let data: any = text;
            if (parseJSON) {
                data = extractJSON(text);
                if (!data) throw new Error('Failed to parse JSON from Gemini');
            }

            const tokens = estimateTokens(prompt + text);
            const cost = estimateCost(tokens, primaryModel);

            if (useCache) await setCachedResponse(prompt, data, primaryModel);
            await logAIUsage({ userId, feature, model: primaryModel, tokens, cost, success: true });

            return {
                success: true,
                data: data as T,
                provider: 'gemini',
                model: primaryModel,
                latencyMs: Date.now() - start,
                cached: false,
                tokensEstimate: tokens,
                costEstimateUsd: cost,
            };
        } catch (err: any) {
            lastError = err.message;
            if (lastError.includes('429') || lastError.toLowerCase().includes('quota')) {
                const wait = 2000 * Math.pow(2, attempt - 1);
                console.warn(`[AI] Gemini rate limited. Waiting ${wait}ms...`);
                await delay(wait);
                continue;
            }
            if (attempt < maxRetries) {
                await delay(1000 * attempt);
            }
        }
    }

    console.warn(`[AI] Gemini failed after ${maxRetries} attempts. Falling back to Groq.`);
    try {
        const groq = getGroqClient();
        const chatCompletion = await groq.chat.completions.create({
            model: fallbackModel,
            messages: [
                { role: 'system', content: 'You are a helpful AI assistant. Always respond with valid JSON.' },
                { role: 'user', content: prompt },
            ],
            temperature,
            max_tokens: 4096,
        });

        const text = chatCompletion.choices[0]?.message?.content ?? '';
        if (!text) throw new Error('Empty response from Groq');

        let data: any = text;
        if (parseJSON) {
            data = extractJSON(text);
            if (!data) throw new Error('Failed to parse JSON from Groq');
        }

        usedProvider = 'groq';
        usedModel = fallbackModel;

        const tokens = estimateTokens(prompt + text);
        const cost = estimateCost(tokens, fallbackModel);

        if (useCache) await setCachedResponse(prompt, data, fallbackModel);
        await logAIUsage({ userId, feature, model: fallbackModel, tokens, cost, success: true, provider: 'groq' });

        return {
            success: true,
            data: data as T,
            provider: 'groq',
            model: fallbackModel,
            latencyMs: Date.now() - start,
            cached: false,
            tokensEstimate: tokens,
            costEstimateUsd: cost,
        };
    } catch (groqError: any) {
        lastError = groqError.message;
    }

    await logAIUsage({ userId, feature, model: usedModel, tokens: 0, cost: 0, success: false });

    return {
        success: false,
        data: null,
        provider: usedProvider,
        model: usedModel,
        latencyMs: Date.now() - start,
        cached: false,
        tokensEstimate: 0,
        costEstimateUsd: 0,
        error: lastError,
    };
}

interface LogPayload {
    userId?: string;
    feature: AIFeatureType;
    model: string;
    tokens: number;
    cost: number;
    success: boolean;
    provider?: AIProvider;
}

async function logAIUsage(payload: LogPayload): Promise<void> {
    try {
        if (payload.userId) {
            await AuditLog.create({
                user_id: payload.userId,
                action: `AI_${payload.feature}`,
                entity_id: payload.feature,
                details: {
                    model: payload.model,
                    provider: payload.provider ?? 'gemini',
                    tokensUsed: payload.tokens,
                    costUsd: payload.cost,
                    success: payload.success,
                },
            });
        }
    } catch {
        // Non-critical
    }
}

export function compressResumeText(resumeJson: any, maxTokens = 1500): string {
    const text = typeof resumeJson === 'string' ? resumeJson : JSON.stringify(resumeJson);
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + '\n... [truncated for token optimization]';
}
