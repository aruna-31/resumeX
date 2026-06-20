import { Request, Response } from 'express';
import { z } from 'zod';
import Application from '../models/Application';
import Job from '../models/Job';
import { Resume } from '../models/Resume';
import { predictJobMatch } from '../services/aiFeatures';
import { isAIConfigured } from '../config/env';
import { calculateMatchScore } from '../services/matchScoreService';
import AuditLog from '../models/AuditLog';

const ApplyBodySchema = z.object({
    jobId: z.string().uuid('Valid jobId required'),
    resumeId: z.string().uuid('Valid resumeId required'),
});

const StatusSchema = z.object({
    status: z.enum(['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED']),
});

async function createApplication(
    jobId: string,
    resumeId: string,
    candidateId: string,
    res: Response
) {

        const exists = await Application.findOne({ where: { job_id: jobId, candidate_id: candidateId } });
        if (exists) {
            return res.status(400).json({ error: 'already_applied', message: 'You have already applied to this job.' });
        }

        const job = await Job.findByPk(jobId);
        const resume = await Resume.findByPk(resumeId);

        if (!job) return res.status(404).json({ error: 'job_not_found' });
        if (!resume || resume.userId !== candidateId) {
            return res.status(400).json({ error: 'resume_not_found' });
        }

        let matchScore = 0;
        let aiExplanation = '';

        if (isAIConfigured()) {
            const analysis = await predictJobMatch(resume.content, {
                title: job.title,
                description: job.description,
                requirements: job.requirements,
            });
            aiExplanation = analysis?.recommendation || '';

            const resumeText = JSON.stringify(resume.content);
            const jobText = `${job.title}\n${job.description}\n${JSON.stringify(job.requirements)}`;
            const embeddingScore = await calculateMatchScore(resumeText, jobText);

            const llmScore = analysis?.overallMatch || 0;
            matchScore = embeddingScore !== null
                ? Math.round((llmScore + embeddingScore) / 2)
                : llmScore;
        }

        const application = await Application.create({
            job_id: jobId,
            candidate_id: candidateId,
            resume_url: resumeId,
            parsed_data: resume.content,
            match_score: matchScore,
            ai_explanation: aiExplanation,
            status: 'APPLIED',
        });

        // Audit Log entry
        await AuditLog.create({
            user_id: candidateId,
            action: 'APPLICATION_SUBMITTED',
            entity_id: application.id,
            details: {
                jobId,
                matchScore,
            },
        }).catch(err => console.warn('[AuditLog] Failed to create application log:', err.message));

        return res.status(201).json({ success: true, application });
}

export const applyToJobBody = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    const parsed = ApplyBodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'validation_error',
            message: parsed.error.issues[0].message,
        });
    }

    try {
        return await createApplication(parsed.data.jobId, parsed.data.resumeId, req.user.id, res);
    } catch (error: any) {
        console.error('[Applications] Apply error:', error.message);
        return res.status(500).json({ error: 'server_error' });
    }
};

export const applyToJob = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const jobId = req.params.id as string;
        const { resumeId } = req.body;
        if (!resumeId) {
            return res.status(400).json({ error: 'validation_error', message: 'resumeId is required' });
        }
        return await createApplication(jobId, resumeId, req.user.id, res);
    } catch (error: any) {
        console.error('[Applications] Apply error:', error.message);
        return res.status(500).json({ error: 'server_error' });
    }
};

export const getMyApplications = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const apps = await Application.findAll({
            where: { candidate_id: req.user.id },
            include: [{ model: Job, as: 'job' }]
        });
        
        res.json({ success: true, applications: apps });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const getJobApplicationsByQuery = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    const jobId = req.query.jobId as string | undefined;
    if (!jobId) {
        return res.status(400).json({ error: 'validation_error', message: 'jobId query parameter is required' });
    }

    req.params.id = jobId;
    return getJobApplications(req, res);
};

export const getJobApplications = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const jobId = req.params.id as string;
        const job = await Job.findByPk(jobId);

        if (!job || (job.hr_id !== req.user.id && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ error: 'forbidden' });
        }

        const apps = await Application.findAll({ where: { job_id: jobId } });
        res.json({ success: true, applications: apps });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    const parsed = StatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'validation_error',
            message: parsed.error.issues[0].message,
        });
    }

    try {
        const applicationId = req.params.id as string;
        const application = await Application.findByPk(applicationId, {
            include: [{ model: Job, as: 'job' }],
        });

        if (!application) {
            return res.status(404).json({ error: 'not_found' });
        }

        const job = await Job.findByPk(application.job_id);
        if (!job || (job.hr_id !== req.user.id && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ error: 'forbidden' });
        }

        await application.update({ status: parsed.data.status });
        res.json({ success: true, application });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};
