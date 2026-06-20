import { Router } from 'express';
import { saveResume, getMyResumes, getResumeVersions, getResumeById, deleteResume } from '../controllers/resumeController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, saveResume);
router.post('/save', authenticate, saveResume);
router.patch('/:id', authenticate, saveResume);

// @route   GET /api/resumes
router.get('/', authenticate, getMyResumes);

// @route   GET /api/resumes/:id/versions
router.get('/:id/versions', authenticate, getResumeVersions);

// @route   GET /api/resumes/:id
router.get('/:id', authenticate, getResumeById);

// @route   DELETE /api/resumes/:id
router.delete('/:id', authenticate, deleteResume);

export default router;
