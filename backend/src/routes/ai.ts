import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authMiddleware';
import { aiQuotaMiddleware, getUserQuota } from '../middleware/aiQuota';
import {
    analyzeATSScore,
    optimizeForATS,
    rewriteResume,
    generateCoverLetter,
    generateInterviewQuestions,
    analyzeSkillGap,
    generateCareerRecommendations,
    predictJobMatch,
    rankCandidates,
    generateHiringInsights,
} from '../services/aiFeatures';
import { Resume } from '../models/Resume';
import Application from '../models/Application';
import Job from '../models/Job';

const router = express.Router();

router.use(authenticate, aiQuotaMiddleware);

function validate<T>(schema: z.ZodSchema<T>) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: 'validation_error',
                message: result.error.issues[0].message,
            });
        }
        (req as any).validatedBody = result.data;
        next();
    };
}

router.get('/quota', async (req, res) => {
    const quota = await getUserQuota(req.user!.id, req.user!.plan);
    res.json({ success: true, quota });
});

const ATSScoreSchema = z.object({
    resumeId: z.string().min(1),
    jobDescription: z.string().optional(),
});

router.post('/ats-score', validate(ATSScoreSchema), async (req, res) => {
    const { resumeId, jobDescription } = (req as any).validatedBody;

    const resume = await Resume.findByPk(resumeId);
    if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'not_found', message: 'Resume not found.' });
    }

    const result = await analyzeATSScore(resume.content, jobDescription);
    if (!result) return res.status(500).json({ error: 'ai_error', message: 'AI analysis failed.' });

    res.json({ success: true, analysis: result });
});

const OptimizeATSSchema = z.object({
    resumeId: z.string().min(1),
    jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
});

router.post('/optimize-ats', validate(OptimizeATSSchema), async (req, res) => {
    const { resumeId, jobDescription } = (req as any).validatedBody;

    const resume = await Resume.findByPk(resumeId);
    if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'not_found' });
    }

    const result = await optimizeForATS(resume.content, jobDescription);
    if (!result) return res.status(500).json({ error: 'ai_error', message: 'Optimization failed.' });

    res.json({ success: true, optimization: result });
});

const RewriteSchema = z.object({
    rawText: z.string().min(100, 'Resume text must be at least 100 characters'),
});

router.post('/rewrite-resume', validate(RewriteSchema), async (req, res) => {
    const { rawText } = (req as any).validatedBody;
    const result = await rewriteResume(rawText);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }
    res.json({ success: true, rewritten: result });
});

const CoverLetterSchema = z.object({
    resumeId: z.string().min(1),
    jobTitle: z.string().min(2),
    companyName: z.string().min(2),
    jobDescription: z.string().min(50),
});

router.post('/cover-letter', validate(CoverLetterSchema), async (req, res) => {
    const { resumeId, jobTitle, companyName, jobDescription } = (req as any).validatedBody;

    const resume = await Resume.findByPk(resumeId);
    if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'not_found' });
    }

    const result = await generateCoverLetter(resume.content, jobTitle, companyName, jobDescription);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }

    res.json({ success: true, coverLetter: result });
});

const InterviewQSchema = z.object({
    resumeId: z.string().min(1),
    roleTitle: z.string().min(2),
    difficulty: z.enum(['Junior', 'Mid', 'Senior']).default('Mid'),
});

router.post('/interview-questions', validate(InterviewQSchema), async (req, res) => {
    const { resumeId, roleTitle, difficulty } = (req as any).validatedBody;

    const resume = await Resume.findByPk(resumeId);
    if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'not_found' });
    }

    const result = await generateInterviewQuestions(roleTitle, resume.content, difficulty);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }

    res.json({ success: true, questions: result });
});

const SkillGapSchema = z.object({
    resumeId: z.string().min(1),
    targetRole: z.string().min(2),
    jobDescription: z.string().min(30),
});

router.post('/skill-gap', validate(SkillGapSchema), async (req, res) => {
    const { resumeId, targetRole, jobDescription } = (req as any).validatedBody;

    const resume = await Resume.findByPk(resumeId);
    if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'not_found' });
    }

    const result = await analyzeSkillGap(resume.content, targetRole, jobDescription);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }

    res.json({ success: true, skillGap: result });
});

router.post('/career-recommendations', async (req, res) => {
    const { resumeId } = req.body;
    if (!resumeId) return res.status(400).json({ error: 'resumeId required' });

    const resume = await Resume.findByPk(resumeId);
    if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'not_found' });
    }

    const result = await generateCareerRecommendations(resume.content);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }

    res.json({ success: true, recommendations: result });
});

const JobMatchSchema = z.object({
    resumeId: z.string().min(1),
    jobId: z.string().min(1),
});

router.post('/job-match', validate(JobMatchSchema), async (req, res) => {
    const { resumeId, jobId } = (req as any).validatedBody;

    const [resume, job] = await Promise.all([
        Resume.findByPk(resumeId),
        Job.findByPk(jobId),
    ]);

    if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'resume_not_found' });
    }
    if (!job) return res.status(404).json({ error: 'job_not_found' });

    const result = await predictJobMatch(resume.content, job);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }

    res.json({ success: true, match: result });
});

router.post('/rank-candidates', async (req, res) => {
    if (req.user!.role !== 'HR' && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'forbidden', message: 'HR access required.' });
    }

    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const job = await Job.findByPk(jobId);
    if (!job || job.hr_id !== req.user!.id) {
        return res.status(404).json({ error: 'not_found' });
    }

    const applications = await Application.findAll({ where: { job_id: jobId } });
    const candidates = applications
        .filter((a: any) => a.parsed_data)
        .map((a: any) => ({
            name: a.parsed_data?.name || 'Unknown',
            id: a.id,
            resume: a.parsed_data,
        }));

    if (candidates.length === 0) {
        return res.status(400).json({ error: 'no_candidates', message: 'No parsed resumes found.' });
    }

    const result = await rankCandidates(job.title, job.description, candidates);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }

    res.json({ success: true, ranking: result });
});

router.post('/hiring-insights', async (req, res) => {
    if (req.user!.role !== 'HR' && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'forbidden' });
    }

    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const job = await Job.findByPk(jobId);
    if (!job || job.hr_id !== req.user!.id) {
        return res.status(404).json({ error: 'not_found' });
    }

    const applications = await Application.findAll({ where: { job_id: jobId } });
    const validApplications = applications
        .filter((a: any) => a.parsed_data)
        .map((a: any) => ({ matchScore: a.match_score, parsedData: a.parsed_data }));

    const result = await generateHiringInsights(job.title, validApplications);
    if (!result) {
        return res.status(503).json({
            error: 'ai_error',
            message: 'AI ranking failed. Check API keys or try again later.',
        });
    }

    res.json({ success: true, insights: result });
});

export default router;
