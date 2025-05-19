import React, { useState, useEffect } from 'react';

const CreateTeamModal = ({ isOpen, onClose, onSubmit, employees }) => {
  const [newTeam, setNewTeam] = useState({ 
    teamName: '', 
    description: '',
    teamLeaders: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewTeam({ teamName: '', description: '', teamLeaders: [] });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!newTeam.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    } else if (newTeam.teamName.trim().length < 2) {
      newErrors.teamName = 'Team name must be at least 2 characters';
    } else if (newTeam.teamName.trim().length > 50) {
      newErrors.teamName = 'Team name cannot exceed 50 characters';
    }

    if (newTeam.description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (!newTeam.teamLeaders.length) {
      newErrors.teamLeaders = 'At least one team leader is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const trimmedTeam = {
        teamName: newTeam.teamName.trim(),
        description: newTeam.description.trim(),
        teamLeaders: newTeam.teamLeaders
      };

      console.log('Form submission - Team data:', trimmedTeam);
      await onSubmit(trimmedTeam);
      
      setNewTeam({ teamName: '', description: '', teamLeaders: [] });
      onClose();
    } catch (error) {
      console.error('Team creation error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to create team. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800 rounded-lg w-full max-w-md relative max-h-[90vh] flex flex-col border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Create New Team</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Team Leaders</label>
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-md bg-gray-700 border border-gray-600 p-2">
                    {employees?.map((employee) => (
                      <label key={employee._id} className="flex items-center space-x-2 text-white">
                        <input
                          type="checkbox"
                          value={employee._id}
                          checked={newTeam.teamLeaders.includes(employee._id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNewTeam(prev => {
                              const ids = new Set(prev.teamLeaders);
                              if (checked) {
                                ids.add(employee._id);
                              } else {
                                ids.delete(employee._id);
                              }
                              return { ...prev, teamLeaders: Array.from(ids) };
                            });
                            setErrors(prev => ({ ...prev, teamLeaders: null }));
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600"
                          disabled={isSubmitting}
                        />
                        <span>{employee.firstName} {employee.lastName}</span>
                      </label>
                    ))}
                  </div>
                  {errors.teamLeaders && (
                    <p className="mt-1 text-sm text-red-500">{errors.teamLeaders}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Team Name</label>
                  <input
                    type="text"
                    value={newTeam.teamName}
                    onChange={(e) => {
                      setNewTeam({ ...newTeam, teamName: e.target.value });
                      setErrors(prev => ({ ...prev, teamName: null }));
                    }}
                    className={`mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.teamName ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter team name"
                    disabled={isSubmitting}
                    required
                  />
                  {errors.teamName && (
                    <p className="mt-1 text-sm text-red-500">{errors.teamName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => {
                      setNewTeam({ ...newTeam, description: e.target.value });
                      setErrors(prev => ({ ...prev, description: null }));
                    }}
                    className={`mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter team description (optional)"
                    rows="3"
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
                {errors.submit && (
                  <div className="p-3 rounded bg-red-900 bg-opacity-50 border border-red-700">
                    <p className="text-sm text-red-500">{errors.submit}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800 sticky bottom-0">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded transition-colors ${
                    isSubmitting 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded transition-colors flex items-center ${
                    isSubmitting
                      ? 'bg-blue-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Team'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;
