import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Cpu, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role')?.toUpperCase() || 'CANDIDATE';
    const isHR = roleParam === 'HR';

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
    });

    useEffect(() => {
        // Reset error on role change
        setError('');
    }, [roleParam]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = {
                ...formData,
                role: roleParam
            };

            const { data } = await api.post(endpoint, payload);
            if (data.user && !data.user.role) data.user.role = isHR ? 'HR' : 'CANDIDATE';
            login(data.token, data.user);

            if (data.user.role === 'HR') {
                navigate('/hr/dashboard');
            } else {
                navigate('/candidate/dashboard');
            }
        } catch (err: unknown) {
            const errorMsg = (err as any).response?.data?.message || 'Authentication failed';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-blue-500/30">
            {/* Background Grain/Noise */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Logo/Brand Area */}
                <div className="text-center mb-10">
                    <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl shadow-xl shadow-black/20 mb-6 transition-colors duration-500 ${isHR ? 'bg-gradient-to-br from-indigo-600 to-indigo-700' : 'bg-gradient-to-br from-blue-600 to-blue-700'}`}>
                        {isHR ? <Briefcase className="text-white" size={28} /> : <Cpu className="text-white" size={28} />}
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase">resumeX <span className={isHR ? 'text-indigo-500' : 'text-blue-500'}>{isHR ? 'Recruiter' : 'Studio'}</span></h1>
                    <p className="text-slate-500 text-sm font-medium mt-2">{isHR ? 'HR Infrastructure v1.0' : 'Candidate Interface v1.0'}</p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-white mb-1">
                                {isLogin ? `${roleParam} Login` : `${roleParam} Registration`}
                            </h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">{isHR ? 'Use your official company email to sign in' : 'Access candidate terminal'}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex gap-3"
                                >
                                    <span>⚠️</span> {error}
                                </motion.div>
                            )}

                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            name="fullName"
                                            type="text"
                                            required
                                            className="w-full bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-11 pr-4 py-4 text-white text-sm placeholder:text-slate-700 transition-all border outline-none font-medium"
                                            placeholder="Enter full name"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity (Email)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-11 pr-4 py-4 text-white text-sm placeholder:text-slate-700 transition-all border outline-none font-medium"
                                        placeholder={isHR ? "you@yourcompany.com" : "you@example.com"}
                                        onChange={handleChange}
                                    />
                                </div>
                                {isHR && <p className="text-[10px] text-slate-500 ml-1">Use your official work email (e.g. name@company.com)</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-11 pr-4 py-4 text-white text-sm placeholder:text-slate-700 transition-all border outline-none font-medium"
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xl mt-4 ${isHR ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-white text-slate-950 hover:bg-slate-200'
                                    }`}
                            >
                                {loading ? 'Initializing...' : (isLogin ? 'Execute Login' : 'Register Identity')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-white/5 text-center">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                            >
                                {isLogin ? 'Request new credentials?' : 'Already have access keys?'}
                            </button>
                        </div>
                    </div>

                    {/* Decorative gradient corner */}
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-10 -mt-10 opacity-10 ${isHR ? 'bg-indigo-500' : 'bg-blue-500'}`} />
                </div>

                <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Protocol Secured</span>
                    </div>
                    <div className="h-1 w-1 bg-slate-500 rounded-full" />
                    <button
                        onClick={() => navigate('/')}
                        className="text-[9px] font-black text-white uppercase tracking-widest hover:text-blue-500 transition-colors"
                    >
                        Switch Interface Role
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
