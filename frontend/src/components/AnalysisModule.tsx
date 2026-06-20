import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Loader2, CheckCircle2, AlertTriangle,
    Lightbulb, ShieldCheck, Gauge, ArrowRight, GraduationCap, Briefcase, Layers, HelpCircle
} from 'lucide-react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../api/client';
import type { EditableResume } from '../types/editor';

interface ProjectAnalysis {
    name: string;
    technicalDepthScore: number;
    relevanceScore: number;
    complexityScore: number;
    notes: string;
}

interface AnalysisResult {
    overallScore?: number;
    skillScore?: number;
    projectScore?: number;
    educationScore?: number;
    experienceScore?: number;
    domainAlignmentScore?: number;
    semanticMatchScore?: number;
    matchPercentage?: number;
    strengths?: string[];
    weaknesses?: string[];
    missingCompetencies?: string[];
    criticalGaps?: string[];
    explanation?: string;
    reasoningSummary?: string;
    improvementSuggestions?: string[];
    improvementRoadmap?: string[];
    contentImprovements?: Array<{ suggestion?: string }>;
    educationAlignment?: string;
    educationFitReasoning?: string;
    projectRelevance?: string;
    projectsAnalyzed?: ProjectAnalysis[];
    experienceLevel?: string;
    maturityReasoning?: string;
    radar?: {
        skillsVsRole: number;
        projectsVsDepth: number;
        educationVsRole: number;
        experienceVsSeniority: number;
    };
}

interface AnalysisModuleProps {
    resume: EditableResume;
}

export const AnalysisModule: React.FC<AnalysisModuleProps> = ({ resume }) => {
    const [jd, setJd] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);

    const [rewriteRole, setRewriteRole] = useState('');
    const [rewriteSectionName, setRewriteSectionName] = useState('Summary');
    const [rewriteText, setRewriteText] = useState('');
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewriteOutput, setRewriteOutput] = useState('');

    const handleAnalyze = async () => {
        if (!jd.trim()) return;
        setIsAnalyzing(true);
        try {
            const response = await api.post('/analysis/optimize', {
                resumeData: resume,
                jobDescription: jd
            });
            setResults(response.data);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRewrite = async () => {
        if (!rewriteRole.trim() || !rewriteSectionName.trim() || !rewriteText.trim()) return;
        setIsRewriting(true);
        setRewriteOutput('');
        try {
            const response = await api.post('/analysis/rewrite-section', {
                role: rewriteRole,
                sectionName: rewriteSectionName,
                sectionText: rewriteText,
            });
            setRewriteOutput(response.data.improvedText || '');
        } catch (error) {
            console.error('Rewrite failed:', error);
        } finally {
            setIsRewriting(false);
        }
    };

    const overall = results?.overallScore ?? results?.semanticMatchScore ?? results?.matchPercentage ?? 0;
    const skillScore = results?.skillScore ?? results?.radar?.skillsVsRole ?? 0;
    const projectScore = results?.projectScore ?? results?.radar?.projectsVsDepth ?? 0;
    const educationScore = results?.educationScore ?? results?.radar?.educationVsRole ?? 0;
    const experienceScore = results?.experienceScore ?? results?.radar?.experienceVsSeniority ?? 0;
    const domainScore = results?.domainAlignmentScore ?? 0;

    const radarData = [
        { subject: 'Skills', value: skillScore, fullMark: 100 },
        { subject: 'Projects', value: projectScore, fullMark: 100 },
        { subject: 'Education', value: educationScore, fullMark: 100 },
        { subject: 'Experience', value: experienceScore, fullMark: 100 },
        { subject: 'Domain', value: domainScore, fullMark: 100 },
    ];

    const missingList = results?.missingCompetencies || results?.criticalGaps || [];
    const improvements = results?.improvementRoadmap || results?.improvementSuggestions || (results?.contentImprovements?.map(c => c.suggestion).filter(Boolean) as string[] || []);

    return (
        <div className="space-y-8 pb-10">
            {!results && (
                <div className="space-y-6">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-blue-500">
                            <Target size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Target Alignment</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">Provide a job description for full-context semantic analysis (skills, projects, education, experience).</p>
                    </div>

                    <textarea
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        placeholder="PASTE JOB DESCRIPTION HERE..."
                        className="w-full h-64 bg-slate-950/50 border border-white/5 rounded-2xl p-6 text-[10px] font-bold uppercase tracking-widest text-slate-300 focus:ring-2 focus:ring-blue-500/30 transition-all resize-none placeholder:text-slate-800 outline-none leading-relaxed"
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !jd.trim()}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-500 disabled:opacity-20 transition-all shadow-xl shadow-blue-900/20"
                    >
                        {isAnalyzing ? <><Loader2 size={16} className="animate-spin" /> Calibrating AI...</> : <><Target size={16} /> Initiate Analysis <ArrowRight size={16} /></>}
                    </button>
                </div>
            )}

            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Gauge – overallScore */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 bg-slate-900/80 border border-white/5 rounded-3xl relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Overall Semantic Score</h4>
                                    <p className="text-4xl font-black text-white tabular-nums">{overall}%</p>
                                </div>
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-colors ${overall >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : overall >= 60 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                    <Gauge size={28} />
                                </div>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overall}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${overall >= 80 ? 'bg-emerald-500' : overall >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                />
                            </div>
                        </motion.div>

                        {/* Radar – skillScore, projectScore, educationScore, experienceScore, domainAlignmentScore */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 bg-slate-900/80 border border-white/5 rounded-3xl"
                        >
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Semantic Fit Dimensions</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                                    <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} strokeWidth={2} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        formatter={(v: any) => [`${v}%`, 'Score']}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Bar chart – missingCompetencies */}
                        {missingList.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 bg-slate-900/80 border border-white/5 rounded-3xl"
                            >
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <AlertTriangle size={14} /> Missing Competencies
                                </h4>
                                <ResponsiveContainer width="100%" height={Math.min(280, missingList.length * 36)}>
                                    <BarChart layout="vertical" data={missingList.slice(0, 10).map((c) => ({ name: c.length > 28 ? c.slice(0, 28) + '…' : c, fullName: c, value: 1 }))} margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} labelFormatter={(_, payload) => payload[0]?.payload?.fullName} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                                            {missingList.slice(0, 10).map((_, i) => (
                                                <Cell key={i} fill="#f59e0b" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}

                        {/* Project Depth Breakdown Panel */}
                        {(results.projectsAnalyzed && results.projectsAnalyzed.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="p-6 bg-slate-900/80 border border-white/5 rounded-3xl"
                            >
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Layers size={14} /> Project Depth Breakdown
                                </h4>
                                <div className="space-y-4">
                                    {results.projectsAnalyzed.map((p, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + i * 0.05 }}
                                            className="p-4 bg-white/5 rounded-2xl border border-white/5"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-white">{p.name}</span>
                                                <span className="text-xs font-black text-indigo-400">{Math.round((p.technicalDepthScore + p.relevanceScore) / 2)}% depth</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <span className="text-[9px] text-slate-500 uppercase">Depth</span>
                                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.technicalDepthScore}%` }} /></div>
                                                    <span className="text-[10px] text-slate-400">{p.technicalDepthScore}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-500 uppercase">Relevance</span>
                                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.relevanceScore}%` }} /></div>
                                                    <span className="text-[10px] text-slate-400">{p.relevanceScore}%</span>
                                                </div>
                                            </div>
                                            {p.notes && <p className="text-[10px] text-slate-500 mt-1">{p.notes}</p>}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Education Fit Indicator */}
                        {(educationScore > 0 || results.educationFitReasoning || results.educationAlignment) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 bg-slate-900/80 border border-white/5 rounded-3xl"
                            >
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <GraduationCap size={14} /> Education Fit
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Role relevance</span>
                                        <span className="text-sm font-bold text-white">{educationScore}%</span>
                                    </div>
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${educationScore}%` }} transition={{ delay: 0.5, duration: 0.6 }} className="h-full bg-violet-500 rounded-full" />
                                    </div>
                                    <div className="group relative">
                                        <span className="text-[10px] text-slate-500 inline-flex items-center gap-1 cursor-help">
                                            <HelpCircle size={12} /> Reasoning
                                        </span>
                                        <div className="absolute left-0 top-6 z-10 hidden group-hover:block w-full max-w-md p-3 bg-slate-800 border border-white/10 rounded-xl text-[10px] text-slate-300 shadow-xl">
                                            {results.educationFitReasoning || results.educationAlignment || 'No reasoning provided.'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Experience maturity */}
                        {(results.experienceLevel || results.maturityReasoning) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="p-6 bg-slate-900/80 border border-white/5 rounded-3xl"
                            >
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Briefcase size={14} /> Experience Level
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-400 capitalize">{String(results.experienceLevel || 'mid')}</span>
                                    <span className="text-xs text-slate-400">{experienceScore}%</span>
                                </div>
                                {results.maturityReasoning && <p className="text-[10px] text-slate-500 leading-relaxed">{results.maturityReasoning}</p>}
                            </motion.div>
                        )}

                        {/* AI Explanation */}
                        {(results.explanation || results.reasoningSummary) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="p-6 bg-slate-900/80 border border-white/5 rounded-3xl"
                            >
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheck size={14} /> AI Explanation
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">{results.explanation || results.reasoningSummary}</p>
                            </motion.div>
                        )}

                        {/* Strengths */}
                        {(results.strengths && results.strengths.length > 0) && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <CheckCircle2 size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Strengths</span>
                                </div>
                                {results.strengths.map((s, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-slate-300">
                                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Improvement roadmap */}
                        {improvements.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <Lightbulb size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Improvement Roadmap</span>
                                </div>
                                {improvements.map((imp, i) => (
                                    <div key={i} className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-xs text-slate-400 leading-relaxed">
                                        {typeof imp === 'string' ? imp : (imp as { suggestion?: string }).suggestion}
                                    </div>
                                ))}
                            </div>
                        )}

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            onClick={() => setResults(null)}
                            className="w-full py-4 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                        >
                            Reset Analysis
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Section Rewriter */}
            <div className="mt-10 space-y-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                        <Lightbulb size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Section Rewriter</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                        Improve any single section for a specific target role.
                    </p>
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        value={rewriteRole}
                        onChange={(e) => setRewriteRole(e.target.value)}
                        placeholder="Target role (e.g. Senior Backend Engineer)"
                        className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-200 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <select
                        value={rewriteSectionName}
                        onChange={(e) => setRewriteSectionName(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                        <option value="Summary">Summary</option>
                        <option value="Experience">Experience</option>
                        <option value="Projects">Projects</option>
                        <option value="Education">Education</option>
                        <option value="Skills">Skills</option>
                    </select>
                    <textarea
                        value={rewriteText}
                        onChange={(e) => setRewriteText(e.target.value)}
                        placeholder="Paste the section you want to improve..."
                        className="w-full h-40 bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-[10px] font-bold uppercase tracking-widest text-slate-200 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                    />
                    <button
                        onClick={handleRewrite}
                        disabled={isRewriting || !rewriteRole.trim() || !rewriteSectionName.trim() || !rewriteText.trim()}
                        className="w-full py-3 bg-emerald-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-400 disabled:opacity-30 transition-all"
                    >
                        {isRewriting ? <><Loader2 size={14} className="animate-spin" /> Refining Section...</> : <>Rewrite Section <ArrowRight size={14} /></>}
                    </button>

                    {rewriteOutput && (
                        <div className="mt-3 p-4 bg-slate-900 border border-emerald-500/30 rounded-2xl text-[10px] font-bold text-slate-200 leading-relaxed whitespace-pre-line">
                            {rewriteOutput}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
