/**
 * AI Usage Badge
 * 
 * Displays current AI quota usage in the dashboard header.
 * Real-time from backend API.
 */

import { useQuery } from '@tanstack/react-query';
import { Brain, Zap } from 'lucide-react';
import { api } from '../api/client';

export function AIUsageBadge() {
    const { data, isLoading } = useQuery({
        queryKey: ['ai-quota'],
        queryFn: () => api.ai.quota().then(r => r.data.quota),
        refetchInterval: 60_000, // refresh every minute
        staleTime: 30_000,
    });

    if (isLoading || !data) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-white/5 rounded-xl animate-pulse">
                <Brain size={13} className="text-slate-600" />
                <div className="h-2.5 w-16 bg-slate-800 rounded" />
            </div>
        );
    }

    const isNearLimit = data.remaining <= 1;
    const isAtLimit = data.remaining === 0;

    return (
        <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-default
                ${isAtLimit
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : isNearLimit
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-slate-900/60 border-white/5 text-slate-400'
                }`}
            title={`AI Requests: ${data.used}/${data.limit} used. Resets at ${new Date(data.resetAt).toLocaleTimeString()}`}
        >
            <Brain size={13} />
            <span>
                {isAtLimit ? 'Limit Reached' : `${data.remaining} AI left`}
            </span>
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${data.percentage}%` }}
                />
            </div>
            {data.plan === 'FREE' && (
                <button
                    onClick={() => window.location.href = '/pricing'}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-md transition-colors text-[9px] font-black uppercase tracking-wider"
                >
                    <Zap size={9} />
                    Pro
                </button>
            )}
        </div>
    );
}
