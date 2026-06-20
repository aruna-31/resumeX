/**
 * Parser Controller — AI Powered Resume Extraction
 * 
 * Extracts text from PDF and uses AI to structure it into a resume.
 */

import { Request, Response } from 'express';
const PDFParse = require('pdf-parse');
import { rewriteResume, analyzeATSScore } from '../services/aiFeatures';

/**
 * POST /api/parser/upload
 * Extract text from PDF and structure it using AI
 */
export const parseResume = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'validation_error', message: 'No resume file uploaded.' });
    }

    try {
        const dataBuffer = req.file.buffer;
        
        // 1. Extract raw text from PDF
        const pdfData = await PDFParse(dataBuffer);
        const rawText = pdfData.text.trim();

        if (!rawText || rawText.length < 50) {
            return res.status(400).json({ 
                error: 'parse_error', 
                message: 'Could not extract enough text from the PDF. Is it an image?' 
            });
        }

        // 2. Structure text using AI
        const structured = await rewriteResume(rawText);
        
        if (!structured) {
            return res.status(500).json({ 
                error: 'ai_error', 
                message: 'AI failed to structure the resume text.' 
            });
        }

        // 3. Optional: Initial ATS Score if targetRole provided
        let initialScore = null;
        const targetRole = (req.body.targetRole || req.query.targetRole) as string;
        if (targetRole) {
            initialScore = await analyzeATSScore(structured, targetRole);
        }

        res.json({
            success: true,
            data: {
                ...structured,
                name: req.file.originalname.replace(/\.[^/.]+$/, '') || 'Candidate'
            },
            analysis: initialScore,
            rawTextLength: rawText.length
        });
    } catch (error: any) {
        console.error('[Parser] Upload error:', error.message);
        res.status(500).json({ error: 'server_error', message: 'Failed to process resume.' });
    }
};

/**
 * POST /api/parser/structure
 * Structure raw text directly (paste resume)
 */
export const structureText = async (req: Request, res: Response) => {
    const { text, targetRole } = req.body;

    if (!text || text.length < 50) {
        return res.status(400).json({ error: 'validation_error', message: 'Resume text is too short.' });
    }

    try {
        const structured = await rewriteResume(text);
        
        if (!structured) {
            return res.status(500).json({ error: 'ai_error' });
        }

        let initialScore = null;
        if (targetRole) {
            initialScore = await analyzeATSScore(structured, targetRole);
        }

        res.json({
            success: true,
            data: structured,
            analysis: initialScore
        });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};
