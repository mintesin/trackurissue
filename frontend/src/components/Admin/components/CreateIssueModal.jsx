import React, { useState, useEffect } from 'react';
import { companyAPI } from '../../../services/api';

const CreateIssueModal = ({ isOpen, onClose, onSubmit }) => {
    // Get current user and company from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentCompany = JSON.parse(localStorage.getItem('company'));
    const [formData, setFormData] = useState({
        topic: '',
        description: '',
        urgency: 'notUrgent',
        status: 'created',
        company: currentCompany?._id || '',
        createdBy: currentUser?._id || ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchFormFields();
        }
    }, [isOpen]);

    const fetchFormFields = async () => {
        try {
            setLoading(true);
            const response = await companyAPI.getIssueFields();
            setFormData(prev => ({
                ...prev,
                ...response.data
            }));
        } catch (err) {
            setError(err.message || 'Error fetching form fields');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        // Check authentication on mount
        const user = JSON.parse(localStorage.getItem('user'));
        const company = JSON.parse(localStorage.getItem('company'));
        
        if (!user || !company) {
            setError('Session expired. Please login again.');
            return;
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requiredFields = ['topic', 'description'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            await onSubmit(formData);
            onClose();
        } catch (error) {
            setError(error.message || 'Error creating issue');
            
            if (error.status === 401) {
                setError('Session expired. Please login again.');
            }
        }
    };

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-lg p-6 text-white">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-white">Create New Issue</h2>
                
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">
                            Topic
                        </label>
                        <input
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">
                            Urgency
                        </label>
                        <select
                            name="urgency"
                            value={formData.urgency}
                            onChange={handleChange}
                            className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        >
                            <option value="notUrgent">Not Urgent</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Create Issue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIssueModal;
