import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { authAPI } from '../../services/api';
import About from '../Common/About';
import WelcomeHeader from '../Common/WelcomeHeader';

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

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      userType: formData.userType
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

      const credentials = formData.userType === 'employee' 
        ? {
            email: formData.email,
            password: formData.password
          }
        : {
            adminEmail: formData.email,
            password: formData.password
          };

      const response = await loginFunction(credentials);

      if (formData.userType === 'company') {
        const { company, token } = response.data;
        if (!company || !token) {
          throw new Error('Invalid response from server');
        }
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
    <div className="min-h-screen bg-gray-900">
      {/* Welcome Header */}
      <div className="container mx-auto px-4 py-4">
        <WelcomeHeader />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* About Section */}
        <About />

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
          </div>

          {error && (
            <div className="rounded-md bg-red-900 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-200">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800"
                />
                <label htmlFor="employee" className="ml-2 block text-sm text-gray-200">
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800"
                />
                <label htmlFor="company" className="ml-2 block text-sm text-gray-200">
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
                    ? 'bg-blue-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="/reset-password" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </a>
              </div>
              {formData.userType === 'company' && (
                <div className="text-sm">
                  <a href="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Register your company
                  </a>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
