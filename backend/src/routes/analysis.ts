import { Router } from 'express';
import { optimizeResume, rewriteSection, runAnalysis } from '../controllers/analysisController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/analysis/run
router.post('/run', authenticate, runAnalysis);

// @route   POST /api/analysis/optimize
router.post('/optimize', authenticate, optimizeResume);

// @route   POST /api/analysis/rewrite-section
router.post('/rewrite-section', authenticate, rewriteSection);

export default router;
