/**
 * @fileoverview Employee Profile Component
 * 
 * This component handles the display and management of employee profiles.
 * It provides functionality for viewing and editing employee information,
 * with different capabilities based on user roles (self vs admin view).
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { employeeAPI, companyAPI } from '../../services/api';

const EmployeeProfile = ({ employeeId }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector(state => state.auth.user);

    useEffect(() => {
        fetchProfile();
    }, [employeeId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching profile for ID:', employeeId);
            const response = await employeeAPI.getProfile(employeeId);
            console.log('Profile API response:', response);
            
            if (!response.data) {
                throw new Error('No profile data received');
            }
            
            setProfile(response.data);
            setFormData(response.data);
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError(err.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const response = await employeeAPI.updateProfile(employeeId, formData);
            if (!response.data) {
                throw new Error('No response data received');
            }
            setProfile(response.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-white p-4">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="bg-red-900 text-red-200 p-4 rounded-lg">
                        <p>{error}</p>
                        <button 
                            onClick={fetchProfile}
                            className="mt-2 bg-red-800 px-4 py-2 rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-white p-4">No profile data found.</div>
                </div>
            </div>
        );
    }

    const canEdit = currentUser?._id === employeeId;
    const isAdmin = currentUser?.role === 'company';

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-gray-800 shadow-md rounded-lg p-6">
                    {!isEditing ? (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {profile.firstName} {profile.lastName}
                                </h2>
                                <div className="flex gap-2">
                                    {canEdit && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                    {isAdmin && !canEdit && (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to deregister this employee?')) {
                                                    try {
                                                        await companyAPI.deregisterEmployee(employeeId);
                                                        window.location.href = '/admin/dashboard';
                                                    } catch (err) {
                                                        setError(err.message || 'Failed to deregister employee');
                                                    }
                                                }
                                            }}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            Deregister Employee
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400">Email</p>
                                    <p className="font-medium text-white">{profile.employeeEmail}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Role</p>
                                    <p className="font-medium text-white capitalize">{profile.authorization}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Address</p>
                                    <p className="font-medium text-white">{profile.streetNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">City</p>
                                    <p className="font-medium text-white">{profile.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">State</p>
                                    <p className="font-medium text-white">{profile.state}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Zipcode</p>
                                    <p className="font-medium text-white">{profile.zipcode}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Country</p>
                                    <p className="font-medium text-white">{profile.country}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Street Address</label>
                                    <input
                                        type="text"
                                        name="streetNumber"
                                        value={formData.streetNumber || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Zipcode</label>
                                    <input
                                        type="text"
                                        name="zipcode"
                                        value={formData.zipcode || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData(profile);
                                    }}
                                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
