import axios from 'axios';

export const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 401) {
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }

        if (status === 429 && data?.error === 'quota_exceeded') {
            window.dispatchEvent(new CustomEvent('ai:quota-exceeded', { detail: data }));
        }

        return Promise.reject(error);
    }
);

export const api = {
    auth: {
        register: (data: { email: string; password: string; displayName: string; role: string }) =>
            apiClient.post('/auth/register', data),
        login: (data: { email: string; password: string }) =>
            apiClient.post('/auth/login', data),
        me: () => apiClient.get('/auth/me'),
        updateProfile: (data: Partial<{ displayName: string; role: string }>) =>
            apiClient.patch('/auth/profile', data),
    },

    resumes: {
        list: () => apiClient.get('/resumes'),
        get: (id: string) => apiClient.get(`/resumes/${id}`),
        create: (data: any) => apiClient.post('/resumes', data),
        update: (id: string, data: any) => apiClient.patch(`/resumes/${id}`, data),
        delete: (id: string) => apiClient.delete(`/resumes/${id}`),
    },

    jobs: {
        list: () => apiClient.get('/jobs'),
        get: (id: string) => apiClient.get(`/jobs/${id}`),
        create: (data: any) => apiClient.post('/jobs', data),
        update: (id: string, data: any) => apiClient.patch(`/jobs/${id}`, data),
    },

    applications: {
        getByJob: (jobId: string) => apiClient.get(`/applications?jobId=${jobId}`),
        apply: (data: any) => apiClient.post('/applications', data),
        updateStatus: (id: string, status: string) => apiClient.patch(`/applications/${id}/status`, { status }),
    },

    ai: {
        quota: () => apiClient.get('/ai/quota'),
        atsScore: (resumeId: string, jobDescription?: string) =>
            apiClient.post('/ai/ats-score', { resumeId, jobDescription }),
        optimizeATS: (resumeId: string, jobDescription: string) =>
            apiClient.post('/ai/optimize-ats', { resumeId, jobDescription }),
        rewriteResume: (rawText: string) =>
            apiClient.post('/ai/rewrite-resume', { rawText }),
        coverLetter: (resumeId: string, jobTitle: string, companyName: string, jobDescription: string) =>
            apiClient.post('/ai/cover-letter', { resumeId, jobTitle, companyName, jobDescription }),
        interviewQuestions: (resumeId: string, roleTitle: string, difficulty: string) =>
            apiClient.post('/ai/interview-questions', { resumeId, roleTitle, difficulty }),
        skillGap: (resumeId: string, targetRole: string, jobDescription: string) =>
            apiClient.post('/ai/skill-gap', { resumeId, targetRole, jobDescription }),
        careerRecommendations: (resumeId: string) =>
            apiClient.post('/ai/career-recommendations', { resumeId }),
        jobMatch: (resumeId: string, jobId: string) =>
            apiClient.post('/ai/job-match', { resumeId, jobId }),
        rankCandidates: (jobId: string) =>
            apiClient.post('/ai/rank-candidates', { jobId }),
        hiringInsights: (jobId: string) =>
            apiClient.post('/ai/hiring-insights', { jobId }),
    },

    hr: {
        dashboard: () => apiClient.get('/hr/dashboard'),
        jobs: () => apiClient.get('/hr/jobs'),
    },

    stripe: {
        createCheckoutSession: (plan: 'PREMIUM' | 'ENTERPRISE') => apiClient.post('/stripe/create-checkout-session', { plan }),
    },

    // Shortcut methods used by components that do: api.get(...) / api.post(...)
    get: <T = any>(url: string, config?: any) => apiClient.get<T>(url, config),
    post: <T = any>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
    put: <T = any>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
    patch: <T = any>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config),
    delete: <T = any>(url: string, config?: any) => apiClient.delete<T>(url, config),
};

export default api;
