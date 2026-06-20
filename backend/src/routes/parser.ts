import { Router } from 'express';
import multer from 'multer';
import { parseResume, structureText } from '../controllers/parserController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/parser/upload
router.post('/upload', authenticate, upload.single('resume'), parseResume);

// @route   POST /api/parser/structure
router.post('/structure', authenticate, structureText);

export default router;
