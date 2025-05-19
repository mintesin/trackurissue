import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI } from '../../../services/api';

const AssignIssue = () => {
    const { issueId } = useParams();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get issue details and teams data in parallel
                const [issueResponse, dashboardResponse] = await Promise.all([
                    companyAPI.getIssue(issueId),
                    companyAPI.getDashboard()
                ]);

                if (!issueResponse?.data?.data || !issueResponse.data.data.topic) {
                    throw new Error('Invalid issue data received');
                }

                setIssue(issueResponse.data.data);
                setTeams(dashboardResponse.data?.teams || []);
            } catch (err) {
                setError(err.message || 'Error fetching data');
                setIssue(null);
                setTeams([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [issueId]);

    const handleAssign = async (teamId) => {
        try {
            setError(null);
            setLoading(true);
            const result = await companyAPI.assignIssue(issueId, teamId);
            
            if (result.data?.data) {
                const successMessage = result.data.message || 'Issue assigned successfully';
                alert(successMessage);
                navigate(-1);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            // Check if this is our "already assigned" error from the backend
            if (err.message && err.message.includes('already been assigned')) {
                setError('This issue has already been assigned');
                // Update the issue state to show current assignment
                setIssue(prev => ({
                    ...prev,
                    status: 'assigned',
                    assignedTeam: prev.assignedTeam || 'another team' // Fallback text if team name not available
                }));
            } else {
                setError(err.message || 'Failed to assign issue');
            }
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
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            {issue?.status === 'assigned' && (
                                <p className="text-gray-300">
                                    This issue is currently assigned to team: <span className="font-semibold">{issue.assignedTeam}</span>
                                </p>
                            )}
                        </div>
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
                        <p className="text-center text-gray-300">No issue data available.</p>
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
                <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
                    <h1 className="text-2xl font-bold mb-4 text-white">Assign Issue</h1>
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2 text-gray-200">Issue Details</h2>
                        <div className="space-y-2">
                            <p className="text-gray-300">
                                <span className="font-medium">Topic: </span> 
                                <span className="ml-2">{issue.topic}</span>
                            </p>
                            <p className="text-gray-300">
                                <span className="font-medium">Description: </span> 
                                <span className="ml-2">{issue.description}</span>
                            </p>
                            <p className="text-gray-300">
                                <span className="font-medium">Urgency: </span> 
                                <span className={`ml-2 ${issue.urgency === 'urgent' ? 'text-red-400' : 'text-gray-400'}`}>
                                    {issue.urgency === 'urgent' ? 'Urgent' : 'Not Urgent'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 text-white">Select Team to Assign</h2>
                    
                    {teams.length === 0 ? (
                        <p className="text-gray-300">No teams available for assignment.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teams.map((team) => (
                                <div 
                                    key={team._id}
                                    className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors bg-gray-700"
                                    onClick={() => handleAssign(team._id)}
                                >
                                    <h3 className="font-semibold text-lg mb-2 text-white">{team.teamName}</h3>
                                    <p className="text-gray-300 text-sm mb-2">{team.description}</p>
                                    <div className="text-sm text-gray-400">
                                        Members: {team.members?.length || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignIssue;
