import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI } from '../../../services/api';

const EditIssue = () => {
    const { issueId } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        topic: '',
        description: '',
        urgency: 'notUrgent'
    });

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                setLoading(true);
                const response = await companyAPI.getIssue(issueId);
                const issueData = response.data.data;
                setIssue(issueData);
                setFormData({
                    topic: issueData.topic,
                    description: issueData.description,
                    urgency: issueData.urgency
                });
            } catch (err) {
                setError(err.message || 'Error fetching issue details');
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [issueId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await companyAPI.updateIssue(issueId, formData);
            navigate(`/admin/issues/${issueId}`);
        } catch (err) {
            setError(err.message || 'Failed to update issue');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 py-8">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 py-8">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                        <p className="text-red-400 text-center">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 block mx-auto"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen bg-gray-900 py-8">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                        <p className="text-center text-gray-300">Issue not found.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 block mx-auto"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                    <h1 className="text-2xl font-bold mb-6 text-white">Edit Issue</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Topic
                            </label>
                            <input
                                type="text"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Urgency
                            </label>
                            <select
                                name="urgency"
                                value={formData.urgency}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                            >
                                <option value="notUrgent">Not Urgent</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditIssue;
