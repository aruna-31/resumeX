import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Application } from '../types';
import { Link } from 'react-router-dom';

export const ApplicationList = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const { data } = await api.get<Application[]>('/applications/me');
                setApplications(data);
            } catch (err) {
                console.error('Failed to fetch applications', err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    if (loading) return <div>Loading applications...</div>;
    if (applications.length === 0) return (
        <div className="text-gray-500 italic">No applications yet. <Link to="/jobs" className="text-blue-600 hover:underline">Browse Jobs</Link></div>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
            {applications.map((app) => (
                <div key={app.id} className="card hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{app.job?.title || 'Unknown Job'}</h3>
                            <p className="text-sm text-gray-500 mb-2">{app.job?.location}</p>
                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-semibold text-gray-700">Applied:</span> {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                <span className="font-semibold text-gray-700">AI Feedback:</span> {app.ai_explanation}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`badge ${app.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                                app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {app.status}
                            </span>
                            <div className="text-2xl font-bold text-slate-700 mt-2">{app.match_score}%</div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Match Score</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
