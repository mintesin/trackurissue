import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { authAPI } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'employee'
  });

  // Focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null); // Clear error when user types
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      userType: formData.userType // Preserve user type selection
    });
    emailInputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginFunction = formData.userType === 'employee' 
        ? authAPI.employeeLogin 
        : authAPI.companyLogin;

      const response = await loginFunction(
        formData.userType === 'employee' 
          ? {
              email: formData.email,
              password: formData.password
            }
          : {
              adminEmail: formData.email,
              password: formData.password
            }
      );

      // Handle different response structures for company and employee login
      if (formData.userType === 'company') {
        const { company, token } = response.data;
        if (!company || !token) {
          throw new Error('Invalid response from server');
        }
        // For company login, the company data contains the admin info
        const userData = {
          _id: company._id,
          name: company.adminName,
          email: company.adminEmail,
          role: 'company'
        };
        login(userData, company, token);
        navigate('/admin/dashboard');
      } else {
        const { employee, company, token } = response.data;
        if (!employee || !company || !token) {
          throw new Error('Invalid response from server');
        }
        const userData = {
          ...employee,
          role: 'employee'
        };
        login(userData, company, token);
        navigate('/employee/dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials and try again.'
      );
      clearForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <input
                id="employee"
                name="userType"
                type="radio"
                value="employee"
                checked={formData.userType === 'employee'}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor="employee" className="ml-2 block text-sm text-gray-900">
                Employee
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="company"
                name="userType"
                type="radio"
                value="company"
                checked={formData.userType === 'company'}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor="company" className="ml-2 block text-sm text-gray-900">
                Company Admin
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
            {formData.userType === 'company' && (
              <div className="text-sm">
                <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Register your company
                </a>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
