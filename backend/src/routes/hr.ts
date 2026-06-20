
import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { screen, exportJobResults, getHrDashboard } from '../controllers/hrController';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
}).fields([{ name: 'resumes', maxCount: 20 }]);

const router = express.Router();

// HR Portal Routes
router.use(authenticate, requireRole('HR', 'ADMIN'));

router.get('/dashboard', getHrDashboard);
router.post('/screen', upload, screen);
router.get('/job/:jobId/export', exportJobResults);

export default router;
