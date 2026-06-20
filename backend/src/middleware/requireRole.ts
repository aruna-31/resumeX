import { Request, Response, NextFunction } from 'express';

type AppRole = 'HR' | 'CANDIDATE' | 'ADMIN';

export function requireRole(...roles: AppRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'unauthorized', message: 'Authentication required.' });
        }

        if (!roles.includes(req.user.role as AppRole)) {
            return res.status(403).json({
                error: 'forbidden',
                message: `This action requires one of: ${roles.join(', ')}`,
            });
        }

        next();
    };
}
