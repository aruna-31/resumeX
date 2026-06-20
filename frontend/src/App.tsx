/**
 * App.tsx — Updated with Firebase Auth + AI Quota Modal
 */

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { HRDashboard } from './pages/HRDashboard';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { Landing3D } from './pages/landing/Landing3D';
import { CandidateAnalysisPage } from './pages/CandidateAnalysisPage';
import { AIQuotaModal } from './components/AIQuotaModal';

// Protected route — requires auth + optional role check
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: 'CANDIDATE' | 'HR' }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-600 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
                        Initializing Portal
                    </span>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/" replace />;

    if (role && user.role !== role) {
        const target = user.role === 'HR' ? '/hr/dashboard' : '/candidate/dashboard';
        return <Navigate to={target} replace />;
    }

    return <>{children}</>;
};

function AppContent() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Global AI Quota Exceeded Modal */}
            <AIQuotaModal />

            <Routes>
                {/* Landing & Public Routes */}
                <Route path="/" element={<Landing3D />} />
                <Route path="/choose-role" element={<Home />} />
                <Route path="/login" element={<Login />} />

                {/* Candidate Routes */}
                <Route
                    path="/candidate/dashboard"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/candidate/analysis/:analysisId"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <CandidateAnalysisPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/builder"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <ResumeBuilder />
                        </ProtectedRoute>
                    }
                />

                {/* HR Routes */}
                <Route
                    path="/hr/dashboard"
                    element={
                        <ProtectedRoute role="HR">
                            <HRDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Redirects */}
                <Route path="/dashboard" element={<Navigate to="/candidate/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 2,
                staleTime: 5 * 60 * 1000, // 5 minutes
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
