import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, Loader2, AlertCircle, FileText, ArrowRight, Target, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

interface UploadResumeProps {
    onParseComplete: (data: any) => void;
}

export const UploadResume: React.FC<UploadResumeProps> = ({ onParseComplete }) => {
    const [status, setStatus] = useState<'idle' | 'extracting' | 'role_selection' | 'analyzing' | 'complete'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [targetRole, setTargetRole] = useState('');
    const [extractedData, setExtractedData] = useState<any>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setStatus('extracting');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await api.post('/parser/upload', formData);
            const data = response.data?.data || response.data;
            setExtractedData(data);
            setStatus('role_selection');
        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.response?.data?.message || 'Failed to process document. Please try again.');
            setStatus('idle');
        }
    };

    const navigate = useNavigate();

    const handleRoleSubmit = async () => {
        if (!targetRole.trim()) return;
        setStatus('analyzing');

        try {
            const resumeData = {
                name: extractedData?.name || 'Uploaded Resume',
                contact: extractedData?.contact,
                summary: extractedData?.summary,
                experience: extractedData?.experience,
                skills: extractedData?.skills,
                projects: extractedData?.projects,
                education: extractedData?.education
            };

            // 1. Save Resume First to get ID (as draft)
            const saveResponse = await api.post('/resumes/save', {
                name: (extractedData?.name || 'New Resume') + ' - ' + targetRole,
                templateId: 'professional',
                content: {
                    ...resumeData,
                    targetRole: targetRole
                }
            });

            if (!saveResponse.data.success) {
                throw new Error('Failed to save resume draft');
            }

            const resumeId = saveResponse.data.resume.id;
            console.log('Saved Resume ID:', resumeId);

            // 2. Run Analysis on Saved Resume
            const analysisResponse = await api.post('/analysis/run', {
                resumeId,
                role: targetRole,
            });

            const { analysis } = analysisResponse.data;
            setAnalysisResult(analysis);

            // 3. Navigate to Analysis Page
            setStatus('complete');
            navigate(`/candidate/analysis/${resumeId}`);

        } catch (err: any) {
            console.error('Analysis Flow Error:', err);

            // Handle Rate Limit Specifically
            if (err.response?.status === 429) {
                setError('AI Usage Limit Reached. Please wait 60 seconds and try again. (Free Tier Limit)');
            } else {
                setError(err.response?.data?.message || 'Analysis failed. Please try again.');
            }

            setStatus('role_selection');
        }
    };

    const handleLoadIntoEditor = () => {
        if (!extractedData) return;
        onParseComplete(extractedData);
    };

    const skipAnalysisAndLoad = () => {
        if (!extractedData) return;
        onParseComplete(extractedData);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-slate-900/80 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="h-20 w-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center mb-8 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                            <Upload size={36} />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">Upload Resume</h3>
                        <p className="text-slate-400 text-xs font-bold mb-10 uppercase tracking-widest max-w-md leading-relaxed">
                            Upload your PDF. We&apos;ll extract your data, suggest skills for your target role, and show an ATS score.
                        </p>

                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <label className="group relative px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-200 transition-all shadow-2xl overflow-hidden">
                            <span className="relative z-10 flex items-center gap-3">
                                Select PDF <ArrowRight size={16} />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                        </label>
                        <p className="mt-8 text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] flex items-center gap-2">
                            <FileText size={10} /> PDF Accepted
                        </p>
                    </motion.div>
                )}

                {status === 'extracting' && (
                    <motion.div
                        key="extracting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-10"
                    >
                        <div className="relative mb-8">
                            <div className="h-24 w-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 z-10 relative">
                                <Loader2 size={40} className="text-emerald-500 animate-spin" />
                            </div>
                            <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">
                            Extracting Data...
                        </h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            Parsing document structure...
                        </p>
                    </motion.div>
                )}

                {(status === 'role_selection' || status === 'analyzing') && (
                    <motion.div
                        key="role"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full max-w-md mx-auto text-center"
                    >
                        <div className="h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500 border border-blue-500/20">
                            <Target size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Target Role (Optional)</h3>
                        <p className="text-slate-400 text-[11px] font-bold mb-8 uppercase tracking-widest">
                            Enter a role to get skill suggestions and ATS score
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest text-left">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g. Senior Product Manager"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all font-black text-sm uppercase tracking-wide mb-6 text-center"
                            autoFocus
                        />

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRoleSubmit();
                                }}
                                disabled={!targetRole.trim() || status === 'analyzing'}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
                            >
                                {status === 'analyzing' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    'Run Gap Analysis'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    skipAnalysisAndLoad();
                                }}
                                className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10"
                            >
                                Skip → Load Editor
                            </button>
                        </div>
                    </motion.div>
                )}



                {status === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-left w-full"
                    >
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
                            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Analysis Complete</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    ATS Score: {analysisResult?.matchPercentage ?? 72}%
                                </p>
                            </div>
                        </div>

                        {analysisResult && (
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle size={12} /> Matching Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(analysisResult.strengths || extractedData?.skills?.slice(0, 5) || []).map((s: string) => (
                                            <span key={s} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded uppercase tracking-wide">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <XCircle size={12} /> Suggested Additions
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(analysisResult.criticalGaps || []).map((s: string) => (
                                            <span key={s} className="px-2 py-1 bg-red-500/10 text-red-400 text-[9px] font-bold rounded uppercase tracking-wide">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleLoadIntoEditor}
                            className="w-full py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-2xl flex items-center justify-center gap-2"
                        >
                            Load Into Editor <ArrowRight size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
        </div>
    );
};
