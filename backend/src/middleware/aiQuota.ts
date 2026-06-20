import { Request, Response, NextFunction } from 'express';

const QUOTA_CONFIG = {
    FREE: { limit: 5, windowHours: 24 },
    PREMIUM: { limit: 50, windowHours: 1 },
    ENTERPRISE: { limit: 200, windowHours: 1 },
} as const;

const usageCache = new Map<string, { count: number, resetAt: number }>();

export async function aiQuotaMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    const { id, plan } = req.user;
    const config = QUOTA_CONFIG[plan] ?? QUOTA_CONFIG.FREE;
    const windowMs = config.windowHours * 60 * 60 * 1000;
    const now = Date.now();

    const cacheKey = id;
    let data = usageCache.get(cacheKey);

    if (!data || now >= data.resetAt) {
        data = { count: 0, resetAt: now + windowMs };
    }

    if (data.count >= config.limit) {
        const resetInMinutes = Math.ceil((data.resetAt - now) / 60000);
        return res.status(429).json({
            error: 'quota_exceeded',
            message: `You've reached your AI limit of ${config.limit} requests per ${config.windowHours} hour(s).`,
            quota: {
                used: data.count,
                limit: config.limit,
                plan: plan,
                resetsInMinutes: resetInMinutes,
                resetAt: new Date(data.resetAt).toISOString(),
            },
            upgrade: {
                available: plan === 'FREE',
                url: '/pricing',
                message: 'Upgrade to Premium for 50 AI requests/hour and advanced features.',
            },
        });
    }

    data.count += 1;
    usageCache.set(cacheKey, data);

    (req as any).quotaInfo = {
        used: data.count,
        limit: config.limit,
        plan: plan,
    };

    next();
}

export async function getUserQuota(uid: string, plan: string) {
    const config = QUOTA_CONFIG[plan as keyof typeof QUOTA_CONFIG] ?? QUOTA_CONFIG.FREE;
    
    const now = Date.now();
    const data = usageCache.get(uid);
    const windowExpired = !data || now >= data.resetAt;
    const count = windowExpired ? 0 : data.count;
    const resetAt = windowExpired ? now + config.windowHours * 3600000 : data!.resetAt;

    return {
        used: count,
        limit: config.limit,
        windowHours: config.windowHours,
        remaining: Math.max(0, config.limit - count),
        resetAt: new Date(resetAt).toISOString(),
        percentage: Math.round((count / config.limit) * 100),
    };
}
