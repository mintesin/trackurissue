import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/api';

const AddEmployeeModal = ({ isOpen, onClose, onSubmit, teams }) => {
  const [formSections, setFormSections] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await authAPI.employeeRegistrationFields();
        setFormSections(response.data.sections);
        
        // Initialize form data with empty values from all fields
        const initialData = {};
        response.data.sections.forEach(section => {
          section.fields.forEach(field => {
            initialData[field.name] = field.value || '';
          });
        });
        // Add teamId field since it's handled separately
        initialData.teamId = '';
        setFormData(initialData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load registration form');
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchFormFields();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get current company from localStorage
    const currentCompany = JSON.parse(localStorage.getItem('company'));
    if (!currentCompany?._id) {
      setError('Company information not found. Please try logging in again.');
      return;
    }

    // Add company ID to form data
    const submitData = {
      ...formData,
      company: currentCompany._id,
      // Ensure isTeamLeader is included even if false
      isTeamLeader: formData.isTeamLeader || false
    };

    onSubmit(submitData);
    // Reset form
    setFormData({});
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="px-6 py-4">
            <p>Loading form fields...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg w-full max-w-md relative max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Add New Employee</h2>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-100 border border-red-400 text-red-700">
              {error}
            </div>
          )}

          <form id="employeeForm" onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="px-6 py-4 overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <div className="space-y-6">
                {formSections.map((section) => (
                  <div key={section.sectionName} className="space-y-4">
                    {section.sectionTitle && (
                      <h3 className="text-lg font-medium text-gray-900">
                        {section.sectionTitle}
                      </h3>
                    )}
                    <div className="space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.name}>
                          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {field.label}
                          </label>
                          <div className="mt-1">
                            {field.type === 'textarea' ? (
                              <textarea
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                rows={3}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            ) : field.type === 'checkbox' ? (
                              <input
                                type="checkbox"
                                id={field.name}
                                name={field.name}
                                checked={formData[field.name] || false}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            ) : (
                              <input
                                type={field.type}
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                            {field.description && (
                              <p className="mt-2 text-sm text-gray-500">{field.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Team Selection - Always shown at the bottom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team</label>
                  <select
                    value={formData.teamId || ''}
                    name="teamId"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a team</option>
                    {teams && teams.length > 0 ? (
                      teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.teamName || 'Unnamed Team'}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No teams available</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
