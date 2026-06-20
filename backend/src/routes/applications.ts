import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import {
    getMyApplications,
    applyToJob,
    applyToJobBody,
    getJobApplications,
    getJobApplicationsByQuery,
    updateApplicationStatus,
} from '../controllers/applicationController';

const router = express.Router();

router.get('/me', authenticate, getMyApplications);
router.get('/', authenticate, getJobApplicationsByQuery);
router.post('/', authenticate, requireRole('CANDIDATE'), applyToJobBody);
router.post('/apply/:id', authenticate, requireRole('CANDIDATE'), applyToJob);
router.get('/job/:id', authenticate, requireRole('HR', 'ADMIN'), getJobApplications);
router.patch('/:id/status', authenticate, requireRole('HR', 'ADMIN'), updateApplicationStatus);

export default router;
