import { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { getEnv } from '../config/env';
import AuditLog from '../models/AuditLog';

const RegisterSchema = z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Display name is required').max(80),
    role: z.enum(['CANDIDATE', 'HR']).default('CANDIDATE'),
});

const LoginSchema = z.object({
    email: z.string().email('Valid email required'),
    password: z.string(),
});

const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, getEnv().jwtSecret, {
        expiresIn: '7d',
    });
};

export async function register(req: Request, res: Response) {
    const parse = RegisterSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({
            error: 'validation_error',
            message: parse.error.issues[0].message,
        });
    }

    const { email, password, fullName, role } = parse.data;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'email_exists', message: 'Email already in use.' });
        }

        const user = await User.create({
            email,
            password_hash: password,
            full_name: fullName,
            role,
        });

        const token = generateToken(user.id);

        await AuditLog.create({
            user_id: user.id,
            action: 'USER_REGISTERED',
            entity_id: user.id,
            details: { role: user.role, email: user.email },
        }).catch(err => console.warn('[AuditLog] Failed to log registration:', err.message));

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('[Auth] Register error:', error);
        return res.status(500).json({ error: 'server_error', message: 'Registration failed.' });
    }
}

export async function login(req: Request, res: Response) {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({
            error: 'validation_error',
            message: 'Invalid email or password',
        });
    }

    const { email, password } = parse.data;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        await AuditLog.create({
            user_id: user.id,
            action: 'USER_LOGGED_IN',
            entity_id: user.id,
            details: { email: user.email },
        }).catch(err => console.warn('[AuditLog] Failed to log login:', err.message));

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        return res.status(500).json({ error: 'server_error', message: 'Login failed.' });
    }
}

export async function getMe(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    return res.status(200).json({
        success: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            fullName: req.user.full_name,
            role: req.user.role,
        },
    });
}
