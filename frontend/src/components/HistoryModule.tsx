import { useState, useEffect } from 'react';
import { History, Clock, RotateCcw, ChevronRight, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

interface HistoryModuleProps {
    resumeId: string;
    onRestore: (content: any) => void;
}

export const HistoryModule: React.FC<HistoryModuleProps> = ({ resumeId, onRestore }) => {
    const [versions, setVersions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (resumeId && resumeId !== 'imported') {
            fetchVersions();
        }
    }, [resumeId]);

    const fetchVersions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/resumes/${resumeId}/versions`);
            setVersions(response.data);
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (resumeId === 'imported') {
        return (
            <div className="p-8 text-center bg-slate-900 border border-white/5 rounded-3xl">
                <History className="mx-auto text-slate-700 mb-4" size={32} />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-relaxed">
                    History tracking unavailable for <br /> ephemeral imported states.
                </p>
                <div className="mt-6 p-4 border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[9px] text-slate-600 font-bold uppercase">Save this draft to initiate <br /> version control protocols.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-500">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Temporal Nodes</span>
                </div>
                <button
                    onClick={fetchVersions}
                    className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors"
                >
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="py-10 flex justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-blue-500">
                        <RotateCcw size={20} />
                    </motion.div>
                </div>
            ) : versions.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 border border-white/5 rounded-3xl">
                    <Save className="mx-auto text-slate-800 mb-4" size={24} />
                    <p className="text-[9px] font-black uppercase text-slate-600">No manual saves detected</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {versions.map((v: any, i: number) => (
                        <motion.div
                            key={v.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative p-4 bg-slate-900 border border-white/5 hover:border-blue-500/30 rounded-2xl cursor-pointer transition-all"
                            onClick={() => onRestore(v.content)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="text-[11px] font-black text-white italic mb-1 uppercase tracking-tight">
                                        Version {versions.length - i}
                                    </h5>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                        {new Date(v.createdAt).toLocaleDateString()} • {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] rounded-2xl pointer-events-none transition-all" />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
