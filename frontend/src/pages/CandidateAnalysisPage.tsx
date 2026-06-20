import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Target, ShieldCheck, Gauge, Layers,
    AlertTriangle, Lightbulb, Loader2, Download
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../api/client';

// Matches the backend V2 schema
interface SemanticAnalysis {
    atsScore: number;
    competencyBreakdown: {
        skills: number;
        projects: number;
        education: number;
        experience: number;
    };
    matchingSkills: string[];
    missingSkills: string[];
    projectRelevance: string;
    educationFit: string;
    experienceStrength: string;
    aiExplanation: string;
    improvementRoadmap: string[];
}

interface AnalysisState {
    data: SemanticAnalysis | null;
    loading: boolean;
    error: string | null;
    resumeName?: string;
    targetRole?: string;
}

export const CandidateAnalysisPage = () => {
    const { analysisId } = useParams();
    const navigate = useNavigate();
    const [state, setState] = useState<AnalysisState>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!analysisId) return;

        const fetchAnalysis = async () => {
            try {
                const { data: resume } = await api.get(`/resumes/${analysisId}`);

                // Extract semantic analysis from resume content
                const analysis = resume.content?.semanticAnalysis;

                if (!analysis) {
                    setState({
                        data: null,
                        loading: false,
                        error: 'No semantic analysis found.'
                    });
                    return;
                }

                setState({
                    data: analysis,
                    loading: false,
                    error: null,
                    resumeName: resume.name,
                    targetRole: resume.content?.targetRole
                });

            } catch (err) {
                console.error('Failed to fetch analysis:', err);
                setState({
                    data: null,
                    loading: false,
                    error: 'Failed to find resume analysis.'
                });
            }
        };

        fetchAnalysis();
    }, [analysisId]);

    const handleBack = () => navigate('/candidate/dashboard');

    if (state.loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                    <p className="text-xs font-black uppercase tracking-widest">Retrieving Neural Analysis...</p>
                </div>
            </div>
        );
    }

    if (state.error || !state.data) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-3xl p-8 text-center">
                    <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-black text-white uppercase mb-2">Analysis Not Found</h2>
                    <p className="text-sm text-slate-400 mb-6">{state.error || "Analysis data is missing."}</p>
                    <button onClick={handleBack} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { data } = state;

    const radarData = [
        { subject: 'Skills', value: data.competencyBreakdown?.skills || 0, fullMark: 100 },
        { subject: 'Projects', value: data.competencyBreakdown?.projects || 0, fullMark: 100 },
        { subject: 'Education', value: data.competencyBreakdown?.education || 0, fullMark: 100 },
        { subject: 'Experience', value: data.competencyBreakdown?.experience || 0, fullMark: 100 },
    ];

    const missingSkillsData = (data.missingSkills || []).slice(0, 8).map(m => ({ name: m, value: 1 }));

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
            {/* Header */}
            <header className="h-16 bg-[#0F172A]/80 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-wider">{state.resumeName}</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{state.targetRole}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:text-white" title="Export PDF"><Download size={18} /></button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Top Row: ATS Score & AI Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                        <div className="flex items-center justify-between z-10 relative">
                            <div>
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">ATS Score</h2>
                                <div className="text-5xl font-black text-white tabular-nums tracking-tighter">{data.atsScore}%</div>
                            </div>
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${data.atsScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                                <Gauge size={28} />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-800">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${data.atsScore}%` }} transition={{ duration: 1 }} className={`h-full ${data.atsScore >= 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 bg-slate-900 border border-white/5 rounded-3xl p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="text-purple-500" size={18} />
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">AI Executive Summary</h2>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{data.aiExplanation}</p>
                    </motion.div>
                </div>

                {/* Middle Row: Radar & Missing Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-slate-900 border border-white/5 rounded-3xl p-6 min-h-[400px] flex flex-col">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Layers size={14} /> Competency Matrix</h3>
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900 border border-white/5 rounded-3xl p-6 min-h-[400px] flex flex-col">
                        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><AlertTriangle size={14} /> Application Gaps</h3>
                        {data.missingSkills && data.missingSkills.length > 0 ? (
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={missingSkillsData} margin={{ left: 0, right: 0 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                                        <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                                            {missingSkillsData.map((_, i) => <Cell key={i} fill="#f59e0b" />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-600 text-xs">No critical gaps.</div>
                        )}
                    </motion.div>
                </div>

                {/* Bottom Row: Roadmap & Text Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Lightbulb size={14} /> Improvement Roadmap</h3>
                        <div className="space-y-4">
                            {(data.improvementRoadmap || []).map((step, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500">{idx + 1}</div>
                                    <p className="text-xs text-slate-400 leading-relaxed pt-0.5">{step}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Target size={14} /> Project Relevance</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{data.projectRelevance || "No project data available."}</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Layers size={14} /> Education Fit</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{data.educationFit || "No education data available."}</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><ShieldCheck size={14} /> Experience Strength</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{data.experienceStrength || "No experience data available."}</p>
                        </div>
                    </motion.div>
                </div>

            </main>
        </div>
    );
};
