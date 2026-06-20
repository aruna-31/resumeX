import { Request, Response } from 'express';
const PDFParse = require('pdf-parse');
import mammoth from 'mammoth';
import Papa from 'papaparse';
import crypto from 'crypto';
import Job from '../models/Job';
import Application from '../models/Application';
import User from '../models/User';
import { rankCandidates, rewriteResume } from '../services/aiFeatures';

async function extractText(buffer: Buffer, filename: string): Promise<string> {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
    if (ext === '.pdf') {
        const data = await PDFParse(buffer);
        return data.text;
    }
    if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }
    return '';
}

export const screen = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const {
            jobRole,
            jobDescription,
            requiredSkills,
            experienceRequired,
        } = req.body;

        const job = await Job.create({
            hr_id: req.user.id,
            ats_job_id: `JOB-${Date.now()}`,
            title: jobRole || 'New Screening Job',
            description: jobDescription || '',
            requirements: {
                skills: Array.isArray(requiredSkills) ? requiredSkills : [],
                minExp: Number(experienceRequired) || 0,
            },
            status: 'OPEN',
        });

        const files = (req.files as any)?.resumes || [];
        const candidates = [];

        for (const file of files) {
            try {
                const text = await extractText(file.buffer, file.originalname);
                if (!text) continue;

                const structured = await rewriteResume(text);
                if (!structured) continue;

                const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
                const candEmail = emailMatch ? emailMatch[0].toLowerCase() : `anon-${crypto.randomUUID()}@imported.local`;
                
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const candName = lines[0] ? lines[0].substring(0, 100) : file.originalname.replace(/\.[^/.]+$/, '');

                let candidateUser = await User.findOne({ where: { email: candEmail } });
                if (!candidateUser) {
                    const tempPassword = crypto.randomUUID();
                    candidateUser = await User.create({
                        email: candEmail,
                        password_hash: tempPassword,
                        full_name: candName,
                        role: 'CANDIDATE',
                    });
                }

                const app = await Application.create({
                    job_id: job.id,
                    candidate_id: candidateUser.id,
                    resume_url: 'uploaded',
                    parsed_data: structured,
                    match_score: 0,
                    status: 'APPLIED',
                });

                candidates.push({
                    name: (structured as any).name || candName,
                    id: app.id,
                    resume: structured
                });
            } catch (err) {
                console.warn(`[HR] Skip file ${file.originalname}:`, err);
            }
        }

        const jsonCandidatesRaw = req.body.candidates || '[]';
        const jsonCandidates = typeof jsonCandidatesRaw === 'string' ? JSON.parse(jsonCandidatesRaw) : jsonCandidatesRaw;
        
        if (Array.isArray(jsonCandidates)) {
            for (const c of jsonCandidates) {
                const candEmail = c.email || `anon-${crypto.randomUUID()}@imported.local`;
                const candName = c.name || 'Imported Candidate';

                let candidateUser = await User.findOne({ where: { email: candEmail } });
                if (!candidateUser) {
                    const tempPassword = crypto.randomUUID();
                    candidateUser = await User.create({
                        email: candEmail,
                        password_hash: tempPassword,
                        full_name: candName,
                        role: 'CANDIDATE',
                    });
                }

                const app = await Application.create({
                    job_id: job.id,
                    candidate_id: candidateUser.id,
                    resume_url: 'imported',
                    parsed_data: c.resume || c,
                    match_score: 0,
                    status: 'APPLIED',
                });
                candidates.push({
                    name: candName,
                    id: app.id,
                    resume: c.resume || c
                });
            }
        }

        if (candidates.length === 0) {
            return res.status(400).json({ error: 'no_candidates', message: 'No valid resumes to screen.' });
        }

        const ranking = await rankCandidates(job.title, job.description, candidates);

        if (ranking) {
            for (const rc of ranking.rankedCandidates) {
                await Application.update(
                    { match_score: rc.overallScore, ai_explanation: rc.strengthSummary },
                    { where: { id: rc.candidateId } }
                );
            }
        }

        res.status(201).json({ success: true, jobId: job.id, ranking });
    } catch (error: any) {
        console.error('[HR] Screen error:', error.message);
        res.status(500).json({ error: 'server_error' });
    }
};

export const exportJobResults = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const { jobId } = req.params;
        const job = await Job.findByPk(jobId as string);

        if (!job || (job.hr_id !== req.user.id && req.user.role !== 'ADMIN')) {
            return res.status(404).json({ error: 'not_found' });
        }

        const applications = await Application.findAll({ where: { job_id: jobId as string } });

        const csvData = applications.map(app => ({
            Name: (app.parsed_data as any)?.name || 'Unknown',
            Score: app.match_score,
            Status: app.status,
            Explanation: app.ai_explanation || '',
            AppliedAt: app.createdAt.toISOString(),
        }));

        const csv = Papa.unparse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`resumex-screening-${jobId}.csv`);
        res.send(csv);
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const getHrDashboard = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const jobs = await Job.findAll({ where: { hr_id: req.user.id } });
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(j => j.status === 'OPEN').length;
        
        let totalApps = 0;
        for(let j of jobs) {
           const count = await Application.count({ where: { job_id: j.id }});
           totalApps += count;
        }

        res.json({
            success: true,
            stats: {
                totalJobs,
                activeJobs,
                totalApplications: totalApps,
            },
            recentJobs: jobs.slice(0, 5)
        });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};
