import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export interface SemanticMetadata {
    technicalAlignment?: number;
    educationFit?: number;
    projectDepthScore?: number;
    domainRelevance?: number;
    riskFlags?: string[];
}

export interface RankedCandidate {
    candidate_id: string;
    full_name: string;
    email: string;
    match_score: number;
    matching_skills: string[];
    missing_skills: string[];
    explanation: string | null;
    rank_position: number;
    semantic_metadata?: SemanticMetadata;
}

interface ShortlistAnalyticsProps {
    candidates: RankedCandidate[];
}

export const ShortlistAnalytics: React.FC<ShortlistAnalyticsProps> = ({ candidates }) => {
    if (candidates.length === 0) return null;

    const avgScore =
        candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length;

    const missingCount: Record<string, number> = {};
    candidates.forEach((c) => {
        (c.missing_skills || []).forEach((skill) => {
            const s = skill.trim();
            if (s) missingCount[s] = (missingCount[s] || 0) + 1;
        });
    });
    const mostCommonMissing = Object.entries(missingCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill: skill.length > 18 ? skill.slice(0, 18) + '…' : skill, count }));

    // Limit to top 20 for visualization
    const topCandidates = candidates.slice(0, 20);

    const scoreDistribution = topCandidates.map((c) => ({
        name: `#${c.rank_position} ${c.full_name.split(' ')[0]}`,
        score: Math.round(c.match_score * 10) / 10,
        fullName: c.full_name,
    }));

    const barColors = scoreDistribution.map((d) => {
        if (d.score >= 80) return '#22c55e';
        if (d.score >= 60) return '#eab308';
        return '#ef4444';
    });

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Shortlist analytics (Top 20 Preview)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Average match score */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                        Average match score (All)
                    </p>
                    <p className="text-3xl font-black text-white tabular-nums">
                        {avgScore.toFixed(1)}
                        <span className="text-lg font-bold text-slate-500 ml-1">%</span>
                    </p>
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${Math.min(100, avgScore)}%` }}
                        />
                    </div>
                </div>

                {/* Candidate score distribution (bar chart) */}
                <div className="md:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                        Candidate score distribution (Top 20)
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                            data={scoreDistribution}
                            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={72}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: any) => [value != null ? `${value}%` : '—', 'Score']}
                                labelFormatter={(_, payload) => payload[0]?.payload?.fullName ?? ''}
                            />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                {scoreDistribution.map((_, i) => (
                                    <Cell key={i} fill={barColors[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Education alignment (semantic) */}
            {candidates.some((c) => c.semantic_metadata?.educationFit != null) && (
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                        Education alignment (semantic - Top 20)
                    </p>
                    <ResponsiveContainer width="100%" height={Math.min(220, topCandidates.length * 32)}>
                        <BarChart
                            layout="vertical"
                            data={topCandidates.map((c) => ({
                                name: `#${c.rank_position} ${c.full_name.split(' ')[0]}`,
                                fullName: c.full_name,
                                value: c.semantic_metadata?.educationFit ?? 0,
                            }))}
                            margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                            <YAxis type="category" dataKey="name" width={72} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(v: any) => [v != null ? `${v}%` : '—', 'Education fit']} labelFormatter={(_, payload) => payload[0]?.payload?.fullName} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Most common missing competencies */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                    Most common missing competencies
                </p>
                {mostCommonMissing.length === 0 ? (
                    <p className="text-slate-500 text-sm">None reported.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={Math.min(320, Math.max(200, mostCommonMissing.length * 32))}>
                        <BarChart
                            data={mostCommonMissing}
                            layout="vertical"
                            margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                type="number"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                allowDecimals={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="skill"
                                width={140}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: any) => [value ?? '—', 'Candidates missing']}
                            />
                            <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
