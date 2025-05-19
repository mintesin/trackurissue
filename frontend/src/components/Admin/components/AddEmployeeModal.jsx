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
        
        const initialData = {};
        response.data.sections.forEach(section => {
          section.fields.forEach(field => {
            initialData[field.name] = field.value || '';
          });
        });
        initialData.teamId = '';
        initialData.birthDate = new Date().toISOString().split('T')[0]; // Set default birthDate
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
    
    const currentCompany = JSON.parse(localStorage.getItem('company'));
    if (!currentCompany?._id) {
      setError('Company information not found. Please try logging in again.');
      return;
    }

    const submitData = {
      ...formData,
      company: currentCompany._id,
      isTeamLeader: formData.isTeamLeader || false
    };

    onSubmit(submitData);
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
        <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700">
          <div className="px-6 py-4">
            <p className="text-gray-300">Loading form fields...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800 rounded-lg w-full max-w-md relative max-h-[90vh] flex flex-col border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Add New Employee</h2>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-900 border border-red-700 text-red-200">
              {error}
            </div>
          )}

          <form id="employeeForm" onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="px-6 py-4 overflow-y-auto flex-1 bg-gray-800 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="space-y-6">
                {formSections.map((section) => (
                  <div key={section.sectionName} className="space-y-4">
                    {section.sectionTitle && (
                      <h3 className="text-lg font-medium text-white">
                        {section.sectionTitle}
                      </h3>
                    )}
                    <div className="space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.name}>
                          <label htmlFor={field.name} className="block text-sm font-medium text-gray-300">
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
                                className="appearance-none block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            ) : field.type === 'checkbox' ? (
                              <input
                                type="checkbox"
                                id={field.name}
                                name={field.name}
                                checked={formData[field.name] || false}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                              />
                            ) : (
                              <input
                                type={field.type}
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                className="appearance-none block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                            {field.description && (
                              <p className="mt-2 text-sm text-gray-400">{field.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Birth Date Field */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300">
                      Birth Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate || ''}
                        onChange={handleChange}
                        required
                        className="appearance-none block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">Team</label>
                  <select
                    value={formData.teamId || ''}
                    name="teamId"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800 sticky bottom-0">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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
