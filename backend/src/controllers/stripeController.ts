import { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';

const stripe = new Stripe(process.env.STRIPE_API_KEY || 'sk_test_dummy', {
    apiVersion: '2023-10-16' as any,
});

export const createCheckoutSession = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });

    try {
        const { plan } = req.body;
        if (plan !== 'PREMIUM' && plan !== 'ENTERPRISE') {
            return res.status(400).json({ error: 'validation_error', message: 'Invalid plan selected.' });
        }

        const stripeKey = process.env.STRIPE_API_KEY;
        // DX: If Stripe credentials are not present, perform a demo upgrade automatically!
        if (!stripeKey) {
            console.warn('[Stripe] STRIPE_API_KEY missing. Demo Mode: Auto-upgraded user to ' + plan);
            await req.user.update({ plan });
            return res.json({
                success: true,
                demo: true,
                message: `Demo Mode: Account successfully upgraded to ${plan}!`,
                url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?upgrade=demo`,
            });
        }

        const priceId = plan === 'PREMIUM' ? process.env.STRIPE_PREMIUM_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID;
        if (!priceId) {
            return res.status(400).json({
                error: 'configuration_error',
                message: `Stripe price ID for plan ${plan} is not configured on the server.`,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: req.user.email,
            metadata: {
                userId: req.user.id,
                plan,
            },
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/candidate/dashboard?upgrade=success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/candidate/dashboard?upgrade=cancelled`,
        });

        return res.json({ success: true, url: session.url });
    } catch (error: any) {
        console.error('[Stripe] Create session error:', error.message);
        return res.status(500).json({ error: 'server_error', message: 'Failed to initiate checkout.' });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
        return res.status(400).json({ error: 'webhook_missing_data', message: 'Missing stripe signature or webhook secret.' });
    }

    let event: any;

    try {
        event = stripe.webhooks.constructEvent((req as any).rawBody || req.body, sig as string, endpointSecret);
    } catch (err: any) {
        console.error('[Stripe Webhook] Verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && (plan === 'PREMIUM' || plan === 'ENTERPRISE')) {
            try {
                const user = await User.findByPk(userId);
                if (user) {
                    await user.update({ plan });
                    console.log(`[Stripe Webhook] Success: Upgraded user ${userId} to ${plan}`);
                }
            } catch (dbErr: any) {
                console.error('[Stripe Webhook] Database update failed:', dbErr.message);
                return res.status(500).send('Database update failed');
            }
        }
    }

    return res.json({ received: true });
};
