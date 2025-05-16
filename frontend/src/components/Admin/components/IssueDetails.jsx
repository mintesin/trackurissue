import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI } from '../../../services/api';

const IssueDetails = () => {
    const { issueId } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                setLoading(true);
                const response = await companyAPI.getIssue(issueId);
                const issueData = response.data.data;
                setIssue(issueData);
            } catch (err) {
                setError(err.message || 'Error fetching issue details');
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [issueId]);

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-300 bg-gray-900">
                <p>Loading issue details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center bg-gray-900">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="p-6 text-center bg-gray-900">
                <p className="text-gray-300">Issue not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h1 className="text-2xl font-bold mb-4 text-white">{issue.topic}</h1>
                <p className="mb-4 text-gray-300 whitespace-pre-wrap">{issue.description}</p>

                <div className="flex flex-wrap gap-4 mb-4">
                    <div className="px-3 py-1 bg-gray-700 rounded text-gray-200">
                        Status: {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        {issue.status === 'assigned' && issue.assignedTeam && (
                            <span className="ml-2">
                                - Assigned to {issue.assignedTeam}
                            </span>
                        )}
                    </div>
                    <div className={`px-3 py-1 rounded ${issue.urgency === 'urgent' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-200'}`}>
                        Urgency: {issue.urgency === 'urgent' ? 'Urgent' : 'Not Urgent'}
                    </div>
                    <div className="px-3 py-1 bg-gray-700 rounded text-gray-200">
                        Created At: {formatDate(issue.createdAt)}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(`/admin/issues/${issueId}/edit`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Edit Issue
                    </button>
                    <button
                        onClick={() => navigate(`/admin/issues/${issueId}/assign`)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Assign Issue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IssueDetails;
