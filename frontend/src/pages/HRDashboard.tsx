import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
    ChevronRight,
    Briefcase,
    LogOut,
    Award,
    Upload,
    Loader2,
    Download,
    Zap,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIUsageBadge } from '../components/AIUsageBadge';

export const HRDashboard = () => {
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [shortlist, setShortlist] = useState<any[]>([]);
    const [loadingShortlist, setLoadingShortlist] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [form, setForm] = useState({
        jobRole: '',
        jobDescription: '',
        requiredSkills: '',
        experienceRequired: '0',
    });
    const [screenLoading, setScreenLoading] = useState(false);
    const [screenError, setScreenError] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await apiClient.get('/jobs');
            setJobs(res.data.jobs || []);
            if (res.data.jobs?.length > 0 && !selectedJobId) {
                setSelectedJobId(res.data.jobs[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch jobs');
        }
    };

    useEffect(() => {
        if (!selectedJobId) return;
        fetchShortlist(selectedJobId);
    }, [selectedJobId]);

    const fetchShortlist = async (jobId: string) => {
        setLoadingShortlist(true);
        try {
            const res = await apiClient.get(`/jobs/${jobId}/shortlist`);
            setShortlist(res.data.ranking?.rankedCandidates || []);
        } catch (err) {
            setShortlist([]);
        } finally {
            setLoadingShortlist(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleStartAIScreening = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) {
            setScreenError('Please upload at least one resume.');
            return;
        }

        setScreenError('');
        setScreenLoading(true);

        try {
            const formData = new FormData();
            formData.append('jobRole', form.jobRole);
            formData.append('jobDescription', form.jobDescription);
            formData.append('requiredSkills', form.requiredSkills);
            formData.append('experienceRequired', form.experienceRequired);
            
            files.forEach(file => {
                formData.append('resumes', file);
            });

            const res = await apiClient.post('/hr/screen', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                await fetchJobs();
                setSelectedJobId(res.data.jobId);
                setFiles([]);
                setForm({ jobRole: '', jobDescription: '', requiredSkills: '', experienceRequired: '0' });
            }
        } catch (err: any) {
            setScreenError(err.response?.data?.message || 'Screening failed.');
        } finally {
            setScreenLoading(false);
        }
    };

    const handleExportCSV = async () => {
        if (!selectedJobId) return;
        try {
            const response = await apiClient.get(`/hr/job/${selectedJobId}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response as any]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `screening-${selectedJobId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error('Export failed', e);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('/noise.svg')]" />

            <header className="h-16 bg-[#0F172A]/80 border-b border-white/5 flex items-center justify-between px-10 shrink-0 sticky top-0 z-50 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/40">
                            <Briefcase size={16} className="text-white fill-white" />
                        </div>
                        <span className="text-lg font-black text-white uppercase tracking-tighter italic">HR <span className="text-indigo-500">CENTRAL</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <AIUsageBadge />
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900 rounded-xl border border-white/5">
                        <div className="h-6 w-6 bg-indigo-500 rounded flex items-center justify-center text-[10px] font-black text-white uppercase italic">
                            {user.email?.[0]}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 truncate max-w-[120px] uppercase tracking-wider">{user.displayName || 'HR Manager'}</span>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-10 py-12 flex flex-col lg:flex-row gap-10">
                
                {/* Left Sidebar: Form & Jobs */}
                <div className="w-full lg:w-1/3 space-y-8">
                    <section className="bg-slate-900 border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <Plus size={18} className="text-indigo-500" />
                            New Screening
                        </h2>
                        
                        <form onSubmit={handleStartAIScreening} className="space-y-4">
                            {screenError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                    {screenError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Job Role</label>
                                <input
                                    name="jobRole"
                                    type="text"
                                    required
                                    value={form.jobRole}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Senior Cloud Architect"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Requirements</label>
                                <textarea
                                    name="jobDescription"
                                    required
                                    value={form.jobDescription}
                                    onChange={handleFormChange}
                                    placeholder="Paste JD or key responsibilities..."
                                    rows={3}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                                />
                            </div>

                            <div className="relative group">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    id="resume-upload"
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="resume-upload"
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer"
                                >
                                    <Upload size={24} className="text-indigo-500 mb-2" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {files.length > 0 ? `${files.length} Resumes Ready` : 'Upload Batch'}
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={screenLoading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-3"
                            >
                                {screenLoading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                {screenLoading ? 'Processing Batch...' : 'Execute AI Ranking'}
                            </button>
                        </form>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Active Pipeline</h2>
                        <div className="space-y-2">
                            {jobs.map(job => (
                                <button
                                    key={job.id}
                                    onClick={() => setSelectedJobId(job.id)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedJobId === job.id ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/20' : 'bg-slate-900 border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-xs font-black uppercase tracking-tight italic ${selectedJobId === job.id ? 'text-white' : 'text-slate-200'}`}>{job.title}</h3>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${selectedJobId === job.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            {job.applicationCount || 0}
                                        </span>
                                    </div>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedJobId === job.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                                        {new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Content: Shortlist */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {loadingShortlist ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-[3rem] border border-white/5">
                                <Loader2 className="text-indigo-500 animate-spin mb-6" size={48} />
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Synthesizing Results</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Running semantic cross-analysis...</p>
                            </motion.div>
                        ) : selectedJobId ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Ranked <span className="text-indigo-500">Shortlist</span></h2>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">AI powered match intelligence</p>
                                    </div>
                                    <button 
                                        onClick={handleExportCSV}
                                        className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {shortlist.map((c, index) => (
                                        <div key={c.candidateId} className="group bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all">
                                            <div 
                                                className="p-6 flex items-center justify-between cursor-pointer"
                                                onClick={() => setExpandedId(expandedId === c.candidateId ? null : c.candidateId)}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white italic">
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">{c.candidateName || 'Candidate'}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-md border border-emerald-500/20">
                                                                MATCH: {c.overallScore}%
                                                            </div>
                                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                                <Award size={12} /> {c.roleAlignment || 'High'} Alignment
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="hidden md:flex flex-wrap gap-2 justify-end max-w-[200px]">
                                                        {c.matchingSkills?.slice(0, 3).map((s: string) => (
                                                            <span key={s} className="text-[8px] font-black text-slate-400 border border-white/5 px-2 py-0.5 rounded-full uppercase">{s}</span>
                                                        ))}
                                                    </div>
                                                    <ChevronRight className={`text-slate-600 transition-transform ${expandedId === c.candidateId ? 'rotate-90' : ''}`} />
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expandedId === c.candidateId && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-white/5 bg-slate-800/30"
                                                    >
                                                        <div className="p-8 space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div>
                                                                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">AI Intelligence Summary</h4>
                                                                    <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                                                                        "{c.strengthSummary || 'No summary available.'}"
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Key Strengths</h4>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {c.matchingSkills?.map((s: string) => (
                                                                                <span key={s} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20">{s}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    {c.missingSkills?.length > 0 && (
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2">Gap Analysis</h4>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {c.missingSkills.map((s: string) => (
                                                                                    <span key={s} className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20">{s}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-slate-500 uppercase">Culture Fit</span>
                                                                        <span className="text-xs font-black text-white italic">Elite</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-slate-500 uppercase">Technical Depth</span>
                                                                        <span className="text-xs font-black text-white italic">Senior+</span>
                                                                    </div>
                                                                </div>
                                                                <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                                                                    View Full Resume
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <Briefcase className="text-slate-800 mb-6" size={64} />
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Select a Job Pipeline</h3>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Or create a new screening to begin analysis</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
