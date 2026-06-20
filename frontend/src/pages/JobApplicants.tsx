import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import type { Application, Job } from '../types';

export const JobApplicants = () => {
    const { id } = useParams<{ id: string }>();
    const [applications, setApplications] = useState<(Application & { candidate: any })[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, appsRes] = await Promise.all([
                    api.get<Job>(`/jobs/${id}`),
                    api.get<Application[]>(`/jobs/${id}/applicants`)
                ]);
                setJob(jobRes.data);
                setApplications(appsRes.data as any); // Type assertion for joined data
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!job) return <div>Job not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link to="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
                <h1 className="text-3xl font-bold mt-2">{job.title} <span className="text-lg font-normal text-gray-500">Applicants</span></h1>
            </div>

            <div className="grid gap-4">
                {applications.map((app) => (
                    <div key={app.id} className="card hover:bg-slate-50 transition-colors cursor-pointer border-l-4" style={{ borderLeftColor: getScoreColor(app.match_score) }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{app.candidate?.full_name || app.candidate?.email || 'Unknown Candidate'}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                                </div>
                                <div className="mt-3 text-gray-700 bg-slate-100 p-3 rounded-md text-sm">
                                    <span className="font-semibold text-indigo-600">AI Analysis:</span> {app.ai_explanation}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-gray-800" style={{ color: getScoreColor(app.match_score) }}>
                                    {app.match_score}%
                                </div>
                                <div className="text-xs uppercase font-bold text-gray-400 mt-1">Match Score</div>
                                <div className="mt-2">
                                    <span className={`badge ${getStatusBadge(app.status)}`}>
                                        {app.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {applications.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No applicants yet.
                    </div>
                )}
            </div>
        </div>
    );
};

// Helpers
const getScoreColor = (score: number) => {
    if (score >= 90) return '#16a34a'; // Green-600
    if (score >= 70) return '#ca8a04'; // Yellow-600
    return '#dc2626'; // Red-600
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'SHORTLISTED': return 'bg-green-100 text-green-800';
        case 'REJECTED': return 'bg-red-100 text-red-800';
        case 'HIRED': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
