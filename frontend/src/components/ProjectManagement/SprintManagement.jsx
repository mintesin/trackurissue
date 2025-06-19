import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Target, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

const SprintManagement = ({ teamId }) => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSprint, setEditingSprint] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        team: teamId
    });

    useEffect(() => {
        fetchSprints();
    }, [teamId]);

    const fetchSprints = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/sprints/team/${teamId}`);
            setSprints(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch sprints');
            console.error('Error fetching sprints:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSprint) {
                await api.put(`/api/sprints/${editingSprint._id}`, formData);
            } else {
                await api.post('/api/sprints', formData);
            }
            
            fetchSprints();
            resetForm();
        } catch (err) {
            console.error('Error saving sprint:', err);
            setError('Failed to save sprint');
        }
    };

    const handleDelete = async (sprintId) => {
        if (window.confirm('Are you sure you want to delete this sprint?')) {
            try {
                await api.delete(`/api/sprints/${sprintId}`);
                fetchSprints();
            } catch (err) {
                console.error('Error deleting sprint:', err);
                setError('Failed to delete sprint');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            team: teamId
        });
        setShowCreateForm(false);
        setEditingSprint(null);
    };

    const startEdit = (sprint) => {
        setEditingSprint(sprint);
        setFormData({
            name: sprint.name,
            description: sprint.description,
            startDate: sprint.startDate.split('T')[0],
            endDate: sprint.endDate.split('T')[0],
            team: sprint.team
        });
        setShowCreateForm(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'planning': return 'bg-yellow-100 text-yellow-800';
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getDaysRemaining = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Sprint Management</h2>
                        <p className="text-sm text-gray-600">Plan and track your team's sprints</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Sprint
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {showCreateForm && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sprint Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                {editingSprint ? 'Update Sprint' : 'Create Sprint'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="p-4">
                {sprints.length === 0 ? (
                    <div className="text-center py-8">
                        <Target className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No sprints</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new sprint.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sprints.map((sprint) => (
                            <div key={sprint._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-medium text-gray-900">{sprint.name}</h3>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => startEdit(sprint)}
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sprint._id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(sprint.status)} mb-3`}>
                                    {sprint.status}
                                </span>

                                {sprint.description && (
                                    <p className="text-sm text-gray-600 mb-3">{sprint.description}</p>
                                )}

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>
                                            {getDaysRemaining(sprint.endDate) > 0 
                                                ? `${getDaysRemaining(sprint.endDate)} days remaining`
                                                : 'Sprint ended'
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Target size={14} />
                                        <span>{sprint.issues?.length || 0} issues</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SprintManagement;
