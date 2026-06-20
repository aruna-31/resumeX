import { Request, Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import AuditLog from '../models/AuditLog';
import { rankCandidates } from '../services/aiFeatures';

export const createJob = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const {
            title,
            description,
            requiredSkills,
            minExp,
            location,
            salary,
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'validation_error', message: 'Title is required' });
        }

        const job = await Job.create({
            hr_id: req.user.id,
            ats_job_id: `JOB-${Date.now()}`,
            title,
            description: description || '',
            requirements: {
                skills: Array.isArray(requiredSkills) ? requiredSkills : [],
                minExp: Number(minExp) || 0,
                location,
                salary,
            },
            status: 'OPEN',
        });

        await AuditLog.create({
            user_id: req.user.id,
            action: 'JOB_CREATED',
            entity_id: job.id,
            details: { title: job.title, status: job.status },
        }).catch(err => console.warn('[AuditLog] Failed to log job creation:', err.message));

        res.status(201).json({ success: true, job });
    } catch (error: any) {
        console.error('[Jobs] Create error:', error.message);
        res.status(500).json({ error: 'server_error', message: 'Failed to create job.' });
    }
};

export const getJobs = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        let jobs;
        if (req.user.role === 'HR' || req.user.role === 'ADMIN') {
            jobs = await Job.findAll({ where: { hr_id: req.user.id } });
        } else {
            jobs = await Job.findAll({ where: { status: 'OPEN' } });
        }

        res.json({ success: true, jobs });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const getJobById = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.id as string;
        const job = await Job.findByPk(jobId);
        if (!job) return res.status(404).json({ error: 'not_found' });

        res.json({ success: true, job });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const getShortlist = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const jobId = req.params.id as string;
        const job = await Job.findByPk(jobId);
        if (!job || (job.hr_id !== req.user.id && req.user.role !== 'ADMIN')) {
            return res.status(404).json({ error: 'not_found' });
        }

        const applications = await Application.findAll({ where: { job_id: job.id } });
        
        const candidatesWithResumes = applications
            .filter((a: any) => a.parsed_data)
            .map((a: any) => ({
                name: (a.parsed_data as any)?.name || 'Candidate',
                id: a.candidate_id,
                resume: a.parsed_data
            }));

        if (candidatesWithResumes.length === 0) {
            return res.json({ success: true, ranking: null, message: 'No candidates have applied yet.' });
        }

        const ranking = await rankCandidates(job.title, job.description, candidatesWithResumes);
        
        res.json({ success: true, ranking });
    } catch (error: any) {
        console.error('[Jobs] Shortlist error:', error.message);
        res.status(500).json({ error: 'server_error' });
    }
};
