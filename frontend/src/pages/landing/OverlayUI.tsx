import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, Cpu, ShieldCheck } from 'lucide-react';

export const OverlayUI = () => {
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none">
            {/* Background Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50" />

            {/* Header / Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-12 flex items-center gap-3"
            >
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <Target className="text-white" size={24} />
                </div>
                <span className="text-2xl font-black text-white uppercase italic tracking-tighter">resumeX</span>
            </motion.div>

            {/* Main Content */}
            <div className="flex flex-col items-center text-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Sparkles size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Next-Gen Intelligence Active</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
                        Structural <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">Intelligence</span>
                    </h1>

                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[11px] mb-12 max-w-lg leading-relaxed">
                        BUILD HIGH-FIDELITY RESUMES. MATCH ARCHITECTURAL SKILLS. <br />
                        SYNCHRONIZE WITH THE FUTURE OF HIRING.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="pointer-events-auto"
                >
                    <button
                        onClick={() => navigate('/choose-role')}
                        className="group relative px-12 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-4 overflow-hidden"
                    >
                        <span className="relative z-10">Initialize Environment</span>
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform relative z-10" />

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </motion.div>
            </div>

            {/* Footer / System Status */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 2 }}
                className="absolute bottom-12 flex items-center gap-12 text-[9px] font-black text-slate-600 uppercase tracking-widest"
            >
                <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-blue-500/50" /> GRID: ACTIVE
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500/50" /> SECURITY: ENCRYPTED
                </div>
                <div className="flex items-center gap-2">
                    <Target size={12} className="text-indigo-500/50" /> ATS: SYNCHRONIZED
                </div>
            </motion.div>

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')]" />
        </div>
    );
};
