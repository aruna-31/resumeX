import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, LogOut,
    Layout, Zap, Upload, Clipboard,
    FileText,
    ArrowRight, Clock, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TemplateGallery } from '../components/TemplateGallery';
import { UploadResume } from '../components/UploadResume';
import { PasteContent } from '../components/PasteContent';
import { INITIAL_TEMPLATES } from '../types/templateData';
import { useResumeStore } from '../store/resumeStore';
import { apiClient } from '../api/client';
import { AIUsageBadge } from '../components/AIUsageBadge';

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const setResumeData = useResumeStore((s) => s.setResumeData);
    const [viewMode, setViewMode] = useState<'DASHBOARD' | 'TEMPLATES' | 'UPLOAD' | 'PASTE'>('DASHBOARD');
    const [searchQuery, setSearchQuery] = useState('');
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await apiClient.get('/resumes');
                setResumes(res.data.resumes || []);
            } catch (err) {
                console.error('Failed to fetch resumes:', err);
            } finally {
                setLoading(false);
            }
        };

        if (viewMode === 'DASHBOARD') {
            fetchResumes();
        }
    }, [viewMode]);

    if (!user) return null;

    const handleUploadParseComplete = (data: any) => {
        setResumeData(data.data || data);
        localStorage.removeItem('resumeX_canvas_v1');
        navigate('/builder');
    };

    const handlePasteParseComplete = (data: any) => {
        setResumeData(data.data || data);
        localStorage.removeItem('resumeX_canvas_v1');
        navigate('/builder');
    };

    const handleCreateBlank = () => {
        localStorage.removeItem('resumeX_canvas_v1');
        navigate('/builder');
    };

    const filteredResumes = resumes.filter(r => 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-500/30">
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('/noise.svg')]" />

            <header className="h-16 bg-[#0F172A]/80 border-b border-white/5 flex items-center justify-between px-10 shrink-0 sticky top-0 z-50 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <Zap size={16} className="text-white fill-white" />
                        </div>
                        <span className="text-lg font-black text-white uppercase tracking-tighter italic">resumeX <span className="text-blue-500">PRO</span></span>
                    </div>
                    <div className="h-4 w-px bg-white/5" />
                    <nav className="flex items-center gap-1">
                        <button
                            onClick={() => setViewMode('DASHBOARD')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'DASHBOARD' ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Dashboard
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <AIUsageBadge />
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900 rounded-xl border border-white/5">
                        <div className="h-6 w-6 bg-blue-500 rounded flex items-center justify-center text-[10px] font-black text-white uppercase italic">
                            {user.email?.[0]}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 truncate max-w-[120px] uppercase tracking-wider">{user.displayName || user.email?.split('@')[0]}</span>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Terminate Session">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-10 py-12">
                {/* Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <button
                        onClick={() => setViewMode('TEMPLATES')}
                        className="group p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-blue-500/50 hover:bg-blue-600/5 transition-all text-left"
                    >
                        <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Layout size={20} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Use Template</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Initialize with engine</p>
                    </button>

                    <button
                        onClick={() => setViewMode('UPLOAD')}
                        className="group p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-600/5 transition-all text-left"
                    >
                        <div className="h-10 w-10 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Upload Resume</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Execute AI parsing</p>
                    </button>

                    <button
                        onClick={() => setViewMode('PASTE')}
                        className="group p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-purple-500/50 hover:bg-purple-600/5 transition-all text-left"
                    >
                        <div className="h-10 w-10 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Clipboard size={20} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Paste Resume</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Structural raw input</p>
                    </button>

                    <button
                        onClick={handleCreateBlank}
                        className="group p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-white/20 hover:bg-white/5 transition-all text-left border-dashed"
                    >
                        <div className="h-10 w-10 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Plus size={20} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Create Blank</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Zero-state canvas</p>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {viewMode === 'TEMPLATES' ? (
                        <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Library <span className="text-blue-500">Engines</span></h2>
                                <button onClick={() => setViewMode('DASHBOARD')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Close Portal</button>
                            </div>
                            <TemplateGallery templates={INITIAL_TEMPLATES} />
                        </motion.div>
                    ) : viewMode === 'UPLOAD' ? (
                        <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Parser <span className="text-emerald-500">Core</span></h2>
                            </div>
                            <UploadResume onParseComplete={handleUploadParseComplete} />
                        </motion.div>
                    ) : viewMode === 'PASTE' ? (
                        <motion.div key="paste" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Structural <span className="text-purple-500">Mapping</span></h2>
                            </div>
                            <PasteContent onParseComplete={handlePasteParseComplete} />
                        </motion.div>
                    ) : (
                        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">

                            {/* Drafts Section */}
                            <section>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Draft <span className="text-blue-500">Archives</span></h2>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Stored documentation across all sessions</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input
                                            type="text"
                                            placeholder="FILTER ARCHIVES..."
                                            className="bg-slate-900 border border-white/5 rounded-xl pl-11 pr-4 py-2 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-blue-500/50 w-64 transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-[2rem] border border-white/5">
                                        <Loader2 className="text-blue-500 animate-spin mb-4" size={32} />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Cloud Storage...</p>
                                    </div>
                                ) : resumes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-[2rem] border border-white/5 border-dashed">
                                        <FileText className="text-slate-700 mb-4" size={48} />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No resumes found in your archives</p>
                                        <button 
                                            onClick={() => setViewMode('TEMPLATES')}
                                            className="mt-6 px-6 py-2 bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-colors"
                                        >
                                            Create First Resume
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden border border-white/5 rounded-[2rem] bg-slate-900/30">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-slate-900/50">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Registry</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ATS Score</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredResumes.map(resume => (
                                                    <tr key={resume.id} className="group hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                                                                    <FileText size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-white truncate max-w-[200px] uppercase italic">{resume.name}</p>
                                                                    <div className="flex items-center gap-2 mt-1 text-slate-600">
                                                                        <Clock size={10} />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                                            {new Date(resume.updatedAt?.seconds * 1000).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex justify-center">
                                                                <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-blue-500/5 text-blue-500 border-blue-500/20">
                                                                    {resume.status || 'DRAFT'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-blue-500" style={{ width: `${resume.atsScore || 0}%` }} />
                                                                </div>
                                                                <span className="text-[10px] font-black text-white">{resume.atsScore || 0}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                                <button
                                                                    onClick={() => {
                                                                        setResumeData(resume);
                                                                        navigate('/builder');
                                                                    }}
                                                                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-lg"
                                                                >
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
