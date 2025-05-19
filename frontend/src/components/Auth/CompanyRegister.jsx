import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [formSections, setFormSections] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                      <div className="mt-1 relative">
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
                        ) : field.type === 'password' ? (
                          <div className="relative">
                            <input
                              id={field.name}
                              name={field.name}
                              type={showPassword ? "text" : "password"}
                              value={formData[field.name]}
                              onChange={handleChange}
                              required={field.required}
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                            >
                              {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </button>
                          </div>
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
