import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export const CreateJobForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        status: 'OPEN',
        requirements: {
            skills: [] as string[],
            minExp: 0,
        },
    });

    const [skillInput, setSkillInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSkillAdd = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            setFormData((prev) => ({
                ...prev,
                requirements: {
                    ...prev.requirements,
                    skills: [...prev.requirements.skills, skillInput.trim()],
                },
            }));
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            requirements: {
                ...prev.requirements,
                skills: prev.requirements.skills.filter((s) => s !== skillToRemove),
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/jobs', formData);
            navigate('/dashboard'); // Refresh or redirect
            // Optionally trigger a refresh of the job list
            window.location.reload();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'HR' && user?.role !== 'ADMIN') {
        return <div className="text-red-500">Only HR can post jobs.</div>;
    }

    return (
        <div className="card max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-6">Post a New Job</h2>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="input-field mt-1"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Frontend Engineer"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        className="input-field mt-1"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Remote, New York, NY"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        className="input-field mt-1"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the role and responsibilities..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Required Skills (Press Enter to add)</label>
                    <input
                        type="text"
                        className="input-field mt-1"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillAdd}
                        placeholder="Type skill and press Enter..."
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.requirements.skills.map((skill) => (
                            <span key={skill} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Experience (Years)</label>
                    <input
                        type="number"
                        min="0"
                        className="input-field mt-1 w-32"
                        value={formData.requirements.minExp}
                        onChange={(e) => setFormData(prev => ({ ...prev, requirements: { ...prev.requirements, minExp: parseInt(e.target.value) } }))}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Posting...' : 'Create Job'}
                    </button>
                </div>
            </form>
        </div>
    );
};
