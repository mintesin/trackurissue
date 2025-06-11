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
    // State to hold the employee profile data
    const [profile, setProfile] = useState(null);
    // State to toggle edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State to hold form data for editing
    const [formData, setFormData] = useState({});
    // State to hold error messages
    const [error, setError] = useState(null);
    // State to indicate loading status
    const [loading, setLoading] = useState(true);
    // Get the current logged-in user from Redux store
    const currentUser = useSelector(state => state.auth.user);

    // Fetch profile data when component mounts or employeeId changes
    useEffect(() => {
        fetchProfile();
    }, [employeeId]);

    // Fetch employee profile from API
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

    // Handle input changes in the edit form
    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Handle form submission to update profile
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

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-white p-4">Loading profile...</div>
                </div>
            </div>
        );
    }

    // Show error state with retry button
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

    // Show message if no profile data is found
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-white p-4">No profile data found.</div>
                </div>
            </div>
        );
    }

    // Determine if the current user can edit their own profile
    const canEdit = currentUser?._id === employeeId;
    // Determine if the current user is an admin (company role)
    const isAdmin = currentUser?.role === 'company';

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-gray-800 shadow-md rounded-lg p-6">
                    {/* Display profile or edit form based on isEditing state */}
                    {!isEditing ? (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {profile.firstName} {profile.lastName}
                                </h2>
                                <div className="flex gap-2">
                                    {/* Show Edit button if user can edit their own profile */}
                                    {canEdit && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                    {/* Show Deregister button for admin users viewing other employees */}
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
                            {/* Display employee profile details */}
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
                        // Edit form for employee profile
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
