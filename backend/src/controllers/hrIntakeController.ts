import { Request, Response } from 'express';
import { processFile } from '../services/intakeProcessor';
import type { NormalizedCandidate } from '../types/intake';

/**
 * POST /api/hr/intake
 * Accepts multiple files (CSV, ZIP, PDF, DOCX). Processes each and returns normalized candidates.
 */
export const intake = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        if (files.length === 0) {
            return res.status(400).json({
                message: 'No files uploaded. Send one or more files (CSV, ZIP, PDF, DOCX).',
                candidates: [],
            });
        }

        const allCandidates: NormalizedCandidate[] = [];
        const errors: { file: string; error: string }[] = [];

        for (const file of files) {
            const result = await processFile(file.buffer, file.originalname);
            if (result.error) {
                errors.push({ file: file.originalname, error: result.error });
            } else {
                allCandidates.push(...result.candidates);
            }
        }

        res.status(200).json({
            success: true,
            candidates: allCandidates,
            count: allCandidates.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error('HR intake error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            candidates: [],
        });
    }
};
