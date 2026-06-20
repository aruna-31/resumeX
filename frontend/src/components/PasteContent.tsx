import React, { useState } from 'react';
import { Sparkles, Clipboard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/client';

interface PasteContentProps {
    onParseComplete: (data: any) => void;
}

export const PasteContent: React.FC<PasteContentProps> = ({ onParseComplete }) => {
    const [text, setText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProcess = async () => {
        if (!text.trim()) return;
        setIsProcessing(true);
        setError(null);

        try {
            // STEP 1: SEND FOR STRUCTURAL MAPPING
            const response = await api.post('/parser/structure', { text });

            // Artificial delay for high-fidelity UX
            setTimeout(() => {
                onParseComplete(response.data.data);
                setIsProcessing(false);
            }, 1200);

        } catch (err: any) {
            console.error('Mapping Error:', err);
            setError(err.response?.data?.message || 'Failed to map narrative. Please try a different text segment.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-12 bg-slate-900/50 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-10">
                <div className="h-12 w-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                    <Clipboard size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Structural Input <span className="text-purple-500">Node</span></h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Manual narrative ingestion protocol</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <div className="relative mb-8 group">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste raw career history, LinkedIn profile text, or document content. We'll build a full ATS resume from it."
                    className="w-full h-80 bg-slate-950/50 border border-white/5 rounded-2xl p-8 text-xs font-bold uppercase tracking-widest text-slate-300 focus:ring-2 focus:ring-purple-500/30 transition-all resize-none placeholder:text-slate-800 outline-none leading-relaxed"
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-2 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                    <Sparkles size={12} className="text-purple-500 animate-pulse" /> Gemini AI Optimized
                </div>

                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
            </div>

            <button
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full h-16 bg-white text-slate-950 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-2xl shadow-white/5 uppercase text-xs tracking-[0.2em]"
            >
                {isProcessing ? (
                    <>
                        <Loader2 size={20} className="animate-spin" /> Synchronizing State...
                    </>
                ) : (
                    <>
                        Initialize Mapping <ArrowRight size={20} />
                    </>
                )}
            </button>

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')]" />
        </div>
    );
};
