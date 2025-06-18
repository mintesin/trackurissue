import React, { useState, useEffect } from 'react';
import { Flag, Calendar, Target, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const MilestoneManagement = ({ teamId }) => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        team: teamId
    });

    useEffect(() => {
        fetchMilestones();
    }, [teamId]);

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/milestones/team/${teamId}`);
            setMilestones(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch milestones');
            console.error('Error fetching milestones:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMilestone) {
                await api.put(`/api/milestones/${editingMilestone._id}`, formData);
            } else {
                await api.post('/api/milestones', formData);
            }
            
            fetchMilestones();
            resetForm();
        } catch (err) {
            console.error('Error saving milestone:', err);
            setError('Failed to save milestone');
        }
    };

    const handleDelete = async (milestoneId) => {
        if (window.confirm('Are you sure you want to delete this milestone?')) {
            try {
                await api.delete(`/api/milestones/${milestoneId}`);
                fetchMilestones();
            } catch (err) {
                console.error('Error deleting milestone:', err);
                setError('Failed to delete milestone');
            }
        }
    };

    const toggleMilestoneStatus = async (milestone) => {
        try {
            const newStatus = milestone.status === 'open' ? 'closed' : 'open';
            await api.put(`/api/milestones/${milestone._id}`, { status: newStatus });
            fetchMilestones();
        } catch (err) {
            console.error('Error updating milestone status:', err);
            setError('Failed to update milestone status');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            team: teamId
        });
        setShowCreateForm(false);
        setEditingMilestone(null);
    };

    const startEdit = (milestone) => {
        setEditingMilestone(milestone);
        setFormData({
            title: milestone.title,
            description: milestone.description,
            dueDate: milestone.dueDate.split('T')[0],
            team: milestone.team
        });
        setShowCreateForm(true);
    };

    const getStatusColor = (status) => {
        return status === 'open' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-red-500';
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
                        <h2 className="text-lg font-semibold text-gray-900">Milestone Management</h2>
                        <p className="text-sm text-gray-600">Track important project milestones and deadlines</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Milestone
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
                                    Milestone Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                {editingMilestone ? 'Update Milestone' : 'Create Milestone'}
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
                {milestones.length === 0 ? (
                    <div className="text-center py-8">
                        <Flag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No milestones</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new milestone.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {milestones.map((milestone) => (
                            <div key={milestone._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleMilestoneStatus(milestone)}
                                            className={`p-1 rounded-full ${
                                                milestone.status === 'closed' 
                                                    ? 'text-green-600 bg-green-100' 
                                                    : 'text-gray-400 hover:text-green-600'
                                            }`}
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <div>
                                            <h3 className={`text-lg font-medium ${
                                                milestone.status === 'closed' 
                                                    ? 'text-gray-500 line-through' 
                                                    : 'text-gray-900'
                                            }`}>
                                                {milestone.title}
                                            </h3>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                                                {milestone.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => startEdit(milestone)}
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(milestone._id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {milestone.description && (
                                    <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar size={14} />
                                        <span>Due: {formatDate(milestone.dueDate)}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Target size={14} />
                                        <span>{milestone.issues?.length || 0} issues</span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {getDaysUntilDue(milestone.dueDate) > 0 
                                            ? `${getDaysUntilDue(milestone.dueDate)} days remaining`
                                            : getDaysUntilDue(milestone.dueDate) === 0
                                            ? 'Due today'
                                            : `${Math.abs(getDaysUntilDue(milestone.dueDate))} days overdue`
                                        }
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{milestone.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getProgressColor(milestone.progress)}`}
                                            style={{ width: `${milestone.progress}%` }}
                                        ></div>
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

export default MilestoneManagement;
