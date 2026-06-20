import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import type { Job } from '../types';
import { useAuth } from '../context/AuthContext';

export const JobDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    // Application State
    const [isApplying, setIsApplying] = useState(false);
    const [resume, setResume] = useState<File | null>(null);
    const [applyingStatus, setApplyingStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<any>(null); // To store match score

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data } = await api.get(`/jobs/${id}`);
                setJob(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchJob();
    }, [id]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resume || !id) return;

        setApplyingStatus('uploading');
        const formData = new FormData();
        formData.append('resume', resume);

        try {
            const { data } = await api.post(`/jobs/${id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(data);
            setApplyingStatus('success');
        } catch (err: any) {
            console.error(err);
            setApplyingStatus('error');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!job) return <div>Job not found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 block">← Back to Jobs</Link>

            <div className="card">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                        <div className="text-gray-500 mt-1">{job.location} • {job.status}</div>
                        <div className="text-sm text-gray-400 mt-1">Job ID: {job.ats_job_id}</div>
                    </div>
                    {user?.role === 'HR' && (
                        <Link to={`/jobs/${job.id}/applicants`} className="btn-secondary">
                            View Applicants
                        </Link>
                    )}
                </div>

                <div className="prose max-w-none text-gray-700 mb-8">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="whitespace-pre-line">{job.description}</p>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        {job.requirements?.skills?.map(skill => (
                            <li key={skill}>{skill}</li>
                        ))}
                        <li>Minimum Experience: {job.requirements?.minExp} years</li>
                    </ul>
                </div>

                {/* Application Section */}
                {user?.role === 'CANDIDATE' && applyingStatus !== 'success' && (
                    <div className="border-t pt-6">
                        {!isApplying ? (
                            <button onClick={() => setIsApplying(true)} className="btn-primary w-full md:w-auto">
                                Apply Now
                            </button>
                        ) : (
                            <form onSubmit={handleApply} className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                <h3 className="text-lg font-semibold mb-4">Upload Resume</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resume (PDF/DOCX)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setResume(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" disabled={applyingStatus === 'uploading'} className="btn-primary">
                                        {applyingStatus === 'uploading' ? 'Analyzing...' : 'Submit Application'}
                                    </button>
                                    <button type="button" onClick={() => setIsApplying(false)} className="btn-ghost">
                                        Cancel
                                    </button>
                                </div>
                                {applyingStatus === 'uploading' && <p className="text-sm text-blue-600 mt-2">AI is analyzing your resume...</p>}
                                {applyingStatus === 'error' && <p className="text-sm text-red-600 mt-2">Failed to apply. Please try again.</p>}
                            </form>
                        )}
                    </div>
                )}

                {/* Success State */}
                {applyingStatus === 'success' && result && (
                    <div className="border-t pt-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Application Submitted!</h3>
                            <p className="text-green-700 mb-4">
                                Your application for <strong>{job.title}</strong> has been received.
                            </p>

                            {/* AI Feedback */}
                            <div className="bg-white p-4 rounded-md shadow-sm text-left max-w-lg mx-auto">
                                <div className="flex justify-between items-center border-b pb-2 mb-2">
                                    <span className="font-semibold text-gray-700">AI Match Score</span>
                                    <span className="text-2xl font-bold text-blue-600">{result.match_score}%</span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    <span className="font-semibold">Analysis:</span> {result.ai_explanation}
                                </p>
                            </div>

                            <div className="mt-6">
                                <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
