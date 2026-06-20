import express from 'express';
import { createJob, getJobById, getJobs, getShortlist } from '../controllers/jobController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = express.Router();

router.post('/', authenticate, requireRole('HR', 'ADMIN'), createJob);
router.get('/', authenticate, getJobs);
router.get('/:id/shortlist', authenticate, getShortlist);
router.get('/:id', authenticate, getJobById);

export default router;
