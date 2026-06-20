import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Download, Plus,
    CheckCircle2, Eye,
    Maximize, Cpu, Layers, Palette, History, Save, Shield, RotateCcw
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeCanvas } from '../components/ResumeCanvas';
import { AnalysisModule } from '../components/AnalysisModule';
import { HistoryModule } from '../components/HistoryModule';
import api from '../api/client';
import type { EditableResume, EditableBlock } from '../types/editor';
import { INITIAL_TEMPLATES } from '../types/templateData';
import { useResumeStore } from '../store/resumeStore';
import { structuredToBlocks } from '../lib/resumeConverter';

export const ResumeBuilder = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const resumeData = useResumeStore((state) => state.resumeData);
    const clearResumeData = useResumeStore((state) => state.clearResumeData);

    const [resume, setResume] = useState<EditableResume>(() => {
        const templateId = searchParams.get('template');
        const baseTemplate = INITIAL_TEMPLATES.find(t => t.templateId === templateId) || INITIAL_TEMPLATES[0];

        // 1. Check global store (Fresh Import from Upload/Paste)
        if (resumeData) {
            const rawExp = resumeData.experience || [];
            const rawEdu = resumeData.education || [];
            const rawProj = resumeData.projects || [];
            const experience = rawExp.map((e: any) => ({
                company: e.company || 'Company',
                role: e.role || 'Role',
                duration: e.duration || '',
                description: e.description || '',
            }));
            const education = rawEdu.map((e: any) => ({
                institution: e.institution ?? e.company ?? 'Institution',
                degree: e.degree ?? e.role ?? '',
                duration: e.duration ?? '',
                details: e.details ?? e.description ?? '',
            }));
            const projects = rawProj.map((p: any) => ({
                name: p.name ?? p.role ?? p.company ?? 'Project',
                description: p.description ?? '',
                tech: p.tech,
            }));
            const structured = {
                header: { name: resumeData.name || '', contact: resumeData.contact || '' },
                summary: resumeData.summary || '',
                experience,
                education,
                projects,
                skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
            };
            const newBlocks = structuredToBlocks(structured);
            const tpl = templateId || 'software_engineer_classic';
            const base = INITIAL_TEMPLATES.find((t) => t.templateId === tpl) || INITIAL_TEMPLATES[0];
            return { ...base, id: crypto.randomUUID(), templateId: tpl, blocks: newBlocks };
        }

        // 2. Fallback to local storage (Autosave)
        const saved = localStorage.getItem('resumeX_canvas_v1');
        if (saved && !templateId) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved resume", e);
            }
        }

        // 3. New Template
        return { ...baseTemplate, id: crypto.randomUUID() };
    });

    // Clear import data after successful initialization to allow autosave to take over
    useEffect(() => {
        if (resumeData) {
            clearResumeData();
        }
    }, [resumeData, clearResumeData]);

    const [activePanel, setActivePanel] = useState<'STRUCTURE' | 'DESIGN' | 'AI' | 'HISTORY'>('STRUCTURE');
    const [lastSaved, setLastSaved] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [resumeId, setResumeId] = useState<string>(() => {
        return resume.id === 'imported' ? '' : resume.id;
    });
    const [resumeMargin, setResumeMargin] = useState<string>(resume.design?.spacing?.margins || '40px');
    const [resumeFontSize, setResumeFontSize] = useState<number>(11);

    // Auto-save logic
    const autoSaveTimer = useRef<any>(null);

    useEffect(() => {
        localStorage.setItem('resumeX_canvas_v1', JSON.stringify(resume));
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Trigger backend auto-save after 2 seconds of inactivity
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            performSave(true);
        }, 3000);

        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        };
    }, [resume]);

    const performSave = async (isAutoSave: boolean = false) => {
        if (!isAutoSave) setIsSaving(true);
        try {
            const response = await api.post('/resumes/save', {
                id: resumeId,
                name: resume.blocks.find(b => b.type === 'HEADER')?.content.name || 'Untitled Resume',
                templateId: resume.templateId,
                content: resume,
                autoSave: isAutoSave
            });

            if (response.data.success) {
                setResumeId(response.data.resume.id);
                if (!isAutoSave) setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            if (!isAutoSave) setIsSaving(false);
        }
    };

    const addBlock = (type: EditableBlock['type']) => {
        const newBlock: EditableBlock = {
            id: crypto.randomUUID(),
            type,
            title: type === 'CUSTOM' ? 'New Section' : type,
            content: (type === 'EXPERIENCE' || type === 'EDUCATION') ? [] : (type === 'HEADER' ? { name: '', contact: '' } : (type === 'SKILLS' ? [] : '')),
            order: resume.blocks.length,
            isVisible: true
        };
        setResume(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    };

    if (!user) return <div className="h-screen bg-slate-950 flex items-center justify-center font-black text-slate-500 uppercase tracking-widest">Access Denied</div>;

    return (
        <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">

            {/* Tactical Control Header */}
            <header className="h-16 bg-[#0F172A] border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/candidate/dashboard" className="h-10 w-10 flex items-center justify-center bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="h-4 w-px bg-white/5" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white uppercase tracking-widest italic">RESUMEX STUDIO</span>
                            <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-md border border-blue-500/20">STABLE</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                            <CheckCircle2 size={10} className="text-emerald-500" /> System Sync: {lastSaved}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => performSave(false)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 text-xs font-black text-slate-400 hover:text-white rounded-xl transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        {isSaving ? <RotateCcw size={14} className="animate-spin" /> : <Save size={14} />}
                        Create Version
                    </button>
                    <button onClick={() => window.print()} className="bg-white text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-200 shadow-xl shadow-white/5 transition-all uppercase tracking-widest">
                        <Download size={15} /> Export PDF
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* Engineering Panel (Sidebar) */}
                <aside className="w-80 bg-[#0F172A] border-r border-white/5 flex flex-col shadow-2xl shrink-0 z-40">
                    <div className="flex p-1.5 gap-1 bg-[#1E293B]/20 m-4 rounded-xl border border-white/5">
                        {[
                            { id: 'STRUCTURE', icon: <Layers size={13} /> },
                            { id: 'DESIGN', icon: <Palette size={13} /> },
                            { id: 'AI', icon: <Cpu size={13} /> },
                            { id: 'HISTORY', icon: <History size={13} /> }
                        ].map(panel => (
                            <button
                                key={panel.id}
                                onClick={() => setActivePanel(panel.id as any)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg text-[8px] font-black tracking-[0.15em] transition-all ${activePanel === panel.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {panel.icon} {panel.id}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            {activePanel === 'STRUCTURE' && (
                                <motion.div key="struct" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <section>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Module Assembly</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['EXPERIENCE', 'EDUCATION', 'SKILLS', 'CUSTOM'].map(t => (
                                                <button key={t} onClick={() => addBlock(t as any)} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group">
                                                    <Plus size={14} className="text-slate-500 group-hover:text-blue-500 mb-2" />
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight group-hover:text-white transition-colors">{t}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="p-5 bg-slate-900 border border-white/5 rounded-2xl relative overflow-hidden">
                                        <div className="flex items-center gap-2 mb-3 text-blue-500">
                                            <Shield size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Secure State</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">Background synchronization active. All structural shifts are decrypted and cached in the local temporal vault before backend persistence.</p>
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl" />
                                    </section>
                                </motion.div>
                            )}

                            {activePanel === 'DESIGN' && (
                                <motion.div key="design" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <section className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ATS Score</span>
                                            <span className="text-lg font-black text-white">92%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                                        </div>
                                        <p className="text-[9px] text-slate-500 mt-1.5">Times New Roman, black text, clear sections</p>
                                    </section>
                                    <section>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Margin</h3>
                                        <select
                                            value={resumeMargin}
                                            onChange={(e) => setResumeMargin(e.target.value)}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="32px">32px (Compact)</option>
                                            <option value="40px">40px (Standard)</option>
                                            <option value="48px">48px (Spacious)</option>
                                            <option value="56px">56px (Wide)</option>
                                        </select>
                                    </section>
                                    <section>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Font Size</h3>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min="9"
                                                max="13"
                                                value={resumeFontSize}
                                                onChange={(e) => setResumeFontSize(Number(e.target.value))}
                                                className="flex-1 h-2 bg-slate-700 rounded-full accent-indigo-500"
                                            />
                                            <span className="text-xs font-black text-white w-8">{resumeFontSize}pt</span>
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Layout Architecture</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(['PROFESSIONAL', 'MODERN', 'CREATIVE'] as const).map(l => (
                                                <button
                                                    key={l}
                                                    onClick={() => setResume(prev => ({ ...prev, layoutType: l }))}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all ${resume.layoutType === l ? 'border-blue-600 bg-blue-600/5' : 'border-white/5 hover:border-white/10'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-[10px] font-black uppercase ${resume.layoutType === l ? 'text-blue-500' : 'text-slate-400'}`}>{l}</span>
                                                        {resume.layoutType === l && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">
                                                        Deploy {l.toLowerCase()} layout engine.
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Chromatic Profile</h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {['#FFFFFF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setResume(prev => ({ ...prev, design: { ...prev.design, colors: { ...prev.design.colors, primary: c } } }))}
                                                    className={`h-8 w-8 rounded-xl border-2 transition-all ${resume.design.colors.primary === c ? 'border-white scale-110 shadow-lg shadow-black' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {activePanel === 'AI' && (
                                <motion.div key="ai" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-900/20 mb-10">
                                        <Cpu className="text-white/40 mb-4" size={32} />
                                        <h4 className="font-black text-sm mb-1 uppercase tracking-tight italic">AI Diagnostic Core</h4>
                                        <p className="text-[11px] text-white/70 font-bold leading-relaxed">Initiate deep structural analysis against target specifications. Recalibrate for ATS synchronization.</p>
                                    </div>
                                    <AnalysisModule resume={resume} />
                                </motion.div>
                            )}

                            {activePanel === 'HISTORY' && (
                                <motion.div key="history" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl relative overflow-hidden mb-8">
                                        <History className="text-blue-500/40 mb-3" size={24} />
                                        <h4 className="font-black text-[10px] text-white/90 mb-1 uppercase tracking-[0.2em]">Temporal Vault</h4>
                                        <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">Access previous structural states. Restoring a node will overwrite the current active workspace.</p>
                                    </div>
                                    <HistoryModule resumeId={resumeId} onRestore={setResume} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>

                {/* Main Viewport (Canvas) */}
                <main className="flex-1 overflow-y-auto bg-slate-950 p-12 custom-scrollbar flex flex-col items-center relative">
                    {/* Viewport Controls */}
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-8 py-4 flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
                        <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em]">
                            <Eye size={14} /> Preview Mode
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                        <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em]">
                            <Maximize size={14} /> Focus Engine
                        </button>
                    </div>

                    <div className="relative z-10 w-full flex justify-center pb-32">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="shadow-[0_0_100px_rgba(30,41,59,0.5)] print:shadow-none"
                        >
                            <ResumeCanvas
                                resume={resume}
                                onUpdate={setResume}
                                margin={resumeMargin}
                                fontSize={resumeFontSize}
                            />
                        </motion.div>
                    </div>

                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
                </main>
            </div>

            <style>{`
                @media print {
                    header, aside, .fixed, .bg-slate-950 {
                        display: none !important;
                    }
                    body, .flex-1, .bg-[#020617], main {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        display: block !important;
                    }
                    .custom-scrollbar {
                        overflow: visible !important;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1E293B;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    );
};


