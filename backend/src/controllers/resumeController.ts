import { Request, Response } from 'express';
import { Resume, ResumeVersion } from '../models/Resume';

export const saveResume = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const routeId = req.params.id as string | undefined;
        const { id: bodyId, name, templateId, content, autoSave = false } = req.body;
        const id = routeId || bodyId;
        const userId = req.user.id;

        let resume;

        if (id) {
            resume = await Resume.findOne({ where: { id, userId } });
            if (resume) {
                await resume.update({
                    name: name || resume.name,
                    templateId: templateId || resume.templateId,
                    content,
                });
            }
        }

        if (!resume) {
            resume = await Resume.create({
                userId,
                name: name || 'Untitled Resume',
                templateId: templateId || 'professional',
                content,
            });
        }

        if (!autoSave) {
            await ResumeVersion.create({
                resumeId: resume.id,
                content,
                changeSummary: `Manual save: ${new Date().toLocaleString()}`,
            });
        }

        res.json({ success: true, resume });
    } catch (error: any) {
        console.error('[Resumes] Save error:', error.message);
        res.status(500).json({ error: 'server_error', message: 'Failed to save resume.' });
    }
};

export const getMyResumes = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const resumes = await Resume.findAll({ where: { userId: req.user.id } });
        res.json({ success: true, resumes });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const getResumeVersions = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const id = req.params.id as string;
        const resume = await Resume.findOne({ where: { id, userId: req.user.id } });

        if (!resume) {
            return res.status(404).json({ error: 'not_found' });
        }

        const versions = await ResumeVersion.findAll({
            where: { resumeId: id },
            order: [['createdAt', 'DESC']],
            limit: 20,
        });

        res.json({ success: true, versions });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const getResumeById = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const id = req.params.id as string;
        const resume = await Resume.findByPk(id);

        if (!resume || (resume.userId !== req.user.id && req.user.role !== 'HR' && req.user.role !== 'ADMIN')) {
            return res.status(404).json({ error: 'not_found' });
        }

        res.json({ success: true, resume });
    } catch (error: any) {
        res.status(500).json({ error: 'server_error' });
    }
};

export const deleteResume = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const { id } = req.params;
        const resume = await Resume.findOne({ where: { id, userId: req.user.id } });

        if (!resume) {
            return res.status(404).json({ error: 'not_found', message: 'Resume not found.' });
        }

        await resume.destroy();
        res.json({ success: true, message: 'Resume deleted successfully.' });
    } catch (error: any) {
        console.error('[Resumes] Delete error:', error.message);
        res.status(500).json({ error: 'server_error', message: 'Failed to delete resume.' });
    }
};
