import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [formSections, setFormSections] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await authAPI.companyRegistrationFields();
        setFormSections(response.data.sections);
        
        // Initialize form data with empty values from all fields
        const initialData = {};
        response.data.sections.forEach(section => {
          section.fields.forEach(field => {
            initialData[field.name] = field.value;
          });
        });
        setFormData(initialData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load registration form');
        setLoading(false);
      }
    };
    
    fetchFormFields();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { data } = await authAPI.companyRegister(formData);
      // Store the token
      localStorage.setItem('token', data.token);
      // Redirect to dashboard with success message
      navigate('/dashboard', { state: { registrationSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-center text-white">Loading registration form...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-opacity-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Register your Company
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {formSections.map((section) => (
              <div key={section.sectionName} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {section.sectionTitle}
                </h3>
                <div className={section.sectionName === 'address' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                  {section.fields.map((field) => (
                    <div key={field.name} className={
                      field.name === 'shortDescription' || field.name === 'streetNumber' ? 'col-span-2' : ''
                    }>
                      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <div className="mt-1">
                        {field.type === 'textarea' ? (
                          <textarea
                            id={field.name}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required={field.required}
                            rows={3}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            value={formData[field.name]}
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

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;
