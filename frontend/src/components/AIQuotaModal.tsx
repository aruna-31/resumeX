/**
 * AI Quota Exceeded Modal
 * 
 * Shown when a free user hits their AI request limit.
 * Displays usage stats and upgrade CTA with premium benefits.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import {
    X, Zap, Crown, CheckCircle, AlertTriangle,
    Clock, BarChart3, Brain, Star
} from 'lucide-react';

interface QuotaData {
    quota?: {
        used: number;
        limit: number;
        plan: string;
        resetsInMinutes: number;
    };
    upgrade?: {
        message: string;
    };
}

export function AIQuotaModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
    const [upgrading, setUpgrading] = useState(false);
    const [upgradeError, setUpgradeError] = useState('');

    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent;
            setQuotaData(customEvent.detail);
            setIsOpen(true);
        };

        window.addEventListener('ai:quota-exceeded', handler);
        return () => window.removeEventListener('ai:quota-exceeded', handler);
    }, []);

    const premiumFeatures = [
        { icon: Brain, text: '50 AI requests per hour', highlight: true },
        { icon: Zap, text: 'ATS Score + Optimization' },
        { icon: Star, text: 'Cover Letter Generator' },
        { icon: BarChart3, text: 'Skill Gap Analysis' },
        { icon: CheckCircle, text: 'Interview Question Generator' },
        { icon: Crown, text: 'Career Recommendations' },
    ];

    const usedPercent = quotaData?.quota
        ? Math.round((quotaData.quota.used / quotaData.quota.limit) * 100)
        : 100;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 flex items-center justify-center z-[101] p-4"
                    >
                        <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-b border-white/5 p-6">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                        <AlertTriangle size={24} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white">AI Limit Reached</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">You've used all your free AI requests</p>
                                    </div>
                                </div>

                                {/* Usage Bar */}
                                {quotaData?.quota && (
                                    <div className="mt-5">
                                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            <span>Usage</span>
                                            <span>{quotaData.quota.used}/{quotaData.quota.limit} requests</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${usedPercent}%` }}
                                                transition={{ delay: 0.3, duration: 0.6 }}
                                                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500">
                                            <Clock size={11} />
                                            <span>Resets in {quotaData.quota.resetsInMinutes} minutes</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upgrade CTA */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Crown size={16} className="text-amber-400" />
                                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Upgrade to Premium</span>
                                </div>

                                <div className="space-y-2.5 mb-6">
                                    {premiumFeatures.map((feature, i) => (
                                        <div key={i} className={`flex items-center gap-3 ${feature.highlight ? 'text-white' : 'text-slate-400'}`}>
                                            <feature.icon size={14} className={feature.highlight ? 'text-emerald-400' : 'text-slate-600'} />
                                            <span className="text-xs font-semibold">{feature.text}</span>
                                            {feature.highlight && (
                                                <span className="ml-auto text-[9px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                    10x more
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black text-white">$9.99</span>
                                        <span className="text-slate-500 text-sm mb-1">/month</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Cancel anytime • No contracts</p>
                                </div>

                                {upgradeError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
                                        {upgradeError}
                                    </div>
                                )}

                                <button
                                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-900/30 hover:shadow-amber-700/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={upgrading}
                                    onClick={async () => {
                                        setUpgradeError('');
                                        setUpgrading(true);
                                        try {
                                            const { data } = await api.stripe.createCheckoutSession('PREMIUM');
                                            if (data?.url) {
                                                window.location.href = data.url;
                                            } else {
                                                throw new Error('No checkout URL returned.');
                                            }
                                        } catch (err: any) {
                                            console.error('Upgrade session initiation failed:', err);
                                            setUpgradeError(err.response?.data?.message || 'Failed to initiate checkout. Please try again.');
                                        } finally {
                                            setUpgrading(false);
                                        }
                                    }}
                                >
                                    {upgrading ? 'Initiating Checkout...' : 'Upgrade to Premium →'}
                                </button>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full mt-3 py-2.5 text-slate-500 hover:text-white text-xs font-medium transition-colors"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
