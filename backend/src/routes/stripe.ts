import express from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/stripeController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.post('/webhook', handleWebhook);

export default router;
