import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
    const navigate = useNavigate();

    const portalOptions = [
        {
            id: 'candidate',
            title: 'Candidate Portal',
            description: 'Build AI-powered resumes, track applications, and optimize your career narrative.',
            icon: <User size={40} className="text-blue-500" />,
            buttonText: 'Continue as Candidate',
            color: 'blue',
            route: '/login?role=candidate'
        },
        {
            id: 'hr',
            title: 'Recruiter Portal',
            description: 'Post jobs, screen candidates with AI, and manage your talent pipeline efficiently.',
            icon: <Briefcase size={40} className="text-indigo-500" />,
            buttonText: 'Continue as HR',
            color: 'indigo',
            route: '/login?role=hr'
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-slate-200 selection:bg-blue-500/30">
            {/* Background Noise Component */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl w-full"
            >
                {/* Brand Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 shadow-2xl">
                        <Zap size={12} /> Intelligence Engine v2.0
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">resumeX</h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-4">Unified Career & Talent Infrastructure</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    {portalOptions.map((option, idx) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="group relative"
                        >
                            <div className="h-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-12 hover:border-white/10 transition-all duration-500 flex flex-col items-center text-center shadow-2xl overflow-hidden">
                                <div className={`h-24 w-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 border border-white/5`}>
                                    {option.icon}
                                </div>

                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">{option.title}</h2>
                                <p className="text-slate-500 font-bold leading-relaxed mb-12 max-w-xs">{option.description}</p>

                                <button
                                    onClick={() => navigate(option.route)}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-3 ${option.color === 'blue'
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500'
                                            : 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 hover:bg-indigo-500'
                                        }`}
                                >
                                    {option.buttonText}
                                </button>

                                {/* Decorative Corner */}
                                <div className={`absolute -top-10 -right-10 w-40 h-40 blur-[80px] rounded-full opacity-20 pointer-events-none ${option.color === 'blue' ? 'bg-blue-600' : 'bg-indigo-600'
                                    }`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Status */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 opacity-40">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Session Protocol</span>
                    </div>
                    <div className="hidden md:block h-1 w-1 bg-slate-600 rounded-full" />
                    <div className="flex items-center gap-3">
                        <Zap size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">High Performance Matching</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
