/**
 * @fileoverview Company Profile Component
 * 
 * This component handles the display and management of company profiles.
 * It provides functionality for viewing and editing company information,
 * accessible to company administrators.
 * 
 * Features:
 * - View company profile details including admin info
 * - Edit company information
 * - Form validation and error handling
 * - Responsive layout with Tailwind CSS
 * - Real-time form updates with optimistic UI
 * 
 * Props:
 * - companyId: String - The ID of the company whose profile is being viewed
 */

import React, { useState, useEffect } from 'react';
import { companyAPI } from '../../../services/api';

const CompanyProfile = ({ companyId }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [companyId]);

    const fetchProfile = async () => {
        try {
            const profileData = await companyAPI.getProfile();
            setProfile(profileData);
            setFormData(profileData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch profile');
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedProfile = await companyAPI.updateProfile(formData);
            setProfile(updatedProfile);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-red-500 p-4">{error}</div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-white p-4">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-gray-800 shadow-md rounded-lg p-6">
                    {!isEditing ? (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {profile.companyName}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Edit Profile
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400">Admin Name</p>
                                    <p className="font-medium text-white">{profile.adminName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Admin Email</p>
                                    <p className="font-medium text-white">{profile.adminEmail}</p>
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
                                <div>
                                    <p className="text-gray-400">Description</p>
                                    <p className="font-medium text-white">{profile.shortDescription}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Admin Name</label>
                                    <input
                                        type="text"
                                        name="adminName"
                                        value={formData.adminName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Street Number</label>
                                    <input
                                        type="text"
                                        name="streetNumber"
                                        value={formData.streetNumber}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Zipcode</label>
                                    <input
                                        type="text"
                                        name="zipcode"
                                        value={formData.zipcode}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300">Description</label>
                                    <textarea
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        rows="3"
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

export default CompanyProfile;
