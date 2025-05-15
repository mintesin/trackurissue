import React, { useState, useEffect } from 'react';
import { employeeAPI, companyAPI } from '../../services/api';

const EmployeeProfile = ({ employeeId }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [employeeId]);

    const fetchProfile = async () => {
        try {
            const response = await employeeAPI.getProfile(employeeId);
            setProfile(response.data.data.employee);
            setFormData(response.data.data.employee);
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
            const response = await employeeAPI.updateProfile(employeeId, formData);
            setProfile(response.data.data.employee);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    if (!profile) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto mt-8">
            {!isEditing ? (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {profile.firstName} {profile.lastName}
                        </h2>
                        <div className="flex gap-2">
                            {/* Show edit button if viewing own profile */}
                            {profile._id === employeeId && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Edit Profile
                                </button>
                            )}
                            {/* Show deregister button if admin is viewing */}
                            {profile._id !== employeeId && (
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to deregister this employee? This action cannot be undone.')) {
                                            try {
                                                await companyAPI.deregisterEmployee(profile._id);
                                                // Redirect to dashboard or show success message
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Email</p>
                            <p className="font-medium">{profile.employeeEmail}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Address</p>
                            <p className="font-medium">{profile.streetNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">City</p>
                            <p className="font-medium">{profile.city}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">State</p>
                            <p className="font-medium">{profile.state}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Zipcode</p>
                            <p className="font-medium">{profile.zipcode}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Country</p>
                            <p className="font-medium">{profile.country}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Role</p>
                            <p className="font-medium capitalize">{profile.authorization}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Street Number</label>
                            <input
                                type="text"
                                name="streetNumber"
                                value={formData.streetNumber}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Zipcode</label>
                            <input
                                type="text"
                                name="zipcode"
                                value={formData.zipcode}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
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
    );
};

export default EmployeeProfile;
