import { Request, Response } from 'express';
import { Resume } from '../models/Resume';
import { analyzeATSScore, optimizeForATS } from '../services/aiFeatures';
import { isAIConfigured } from '../config/env';

export const runAnalysis = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const { resumeId, role } = req.body;

        if (!resumeId || !role) {
            return res.status(400).json({ error: 'validation_error', message: 'Missing resumeId or target role' });
        }

        const resume = await Resume.findByPk(resumeId);
        if (!resume || resume.userId !== req.user.id) {
            return res.status(404).json({ error: 'not_found' });
        }

        if (!isAIConfigured()) {
            return res.status(503).json({
                error: 'ai_unavailable',
                message: 'AI is not configured. Set GEMINI_API_KEY and/or GROQ_API_KEY.',
            });
        }

        const analysis = await analyzeATSScore(resume.content, role);
        if (!analysis) {
            return res.status(503).json({
                error: 'ai_error',
                message: 'AI analysis failed. Please try again later.',
            });
        }

        await resume.update({
            content: {
                ...resume.content,
                semanticAnalysis: analysis,
                targetRole: role
            }
        });

        res.json({
            success: true,
            analysisId: resumeId,
            analysis
        });
    } catch (error: any) {
        console.error('[Analysis] Run error:', error.message);
        res.status(500).json({ error: 'server_error' });
    }
};

export const optimizeResume = async (req: Request, res: Response) => {
    try {
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription) {
            return res.status(400).json({ error: 'validation_error' });
        }

        const analysis = await analyzeATSScore(resumeData, jobDescription);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const rewriteSection = async (req: Request, res: Response) => {
    try {
        const { role, sectionName, sectionText } = req.body;
        
        const result = await optimizeForATS({ [sectionName]: sectionText }, role || '');
        
        const improvedText = result?.optimizedSections?.experience?.[0]?.optimized 
                          || result?.optimizedSections?.summary 
                          || sectionText;

        res.json({ success: true, improvedText });
    } catch (error) {
        res.status(500).json({ error: 'server_error' });
    }
};
