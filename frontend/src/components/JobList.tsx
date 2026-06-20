import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import type { Job } from '../types';
import { Link } from 'react-router-dom';

export const JobList = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const endpoint = user?.role === 'HR' ? `/jobs?hr_id=${user.id}` : '/jobs';
                const response = await api.get<Job[]>(endpoint);
                setJobs(response.data);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user]);

    if (loading) return <div>Loading jobs...</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
                {user?.role === 'HR' ? 'Your Posted Jobs' : 'Open Positions'}
            </h2>

            {jobs.length === 0 && (
                <p className="text-gray-500">No jobs found.</p>
            )}

            {jobs.map((job) => (
                <div key={job.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">{job.location} • {job.status}</p>
                            <p className="text-gray-700 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link to={`/jobs/${job.id}`} className="btn-secondary text-sm">
                                View Details
                            </Link>
                            {user?.role === 'HR' && (
                                <Link to={`/jobs/${job.id}/applicants`} className="btn-primary text-sm text-center">
                                    View Applicants
                                </Link>
                            )}
                        </div>
                    </div>
                    {/* Skills Tags */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {job.requirements?.skills?.map((skill) => (
                            <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
