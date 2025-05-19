import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import About from '../Common/About';
import WelcomeHeader from '../Common/WelcomeHeader';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearForm = () => {
    setFormData(prev => ({
      ...prev,
      password: ''
    }));
    passwordInputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginFunction = formData.userType === 'employee' 
        ? authAPI.employeeLogin 
        : authAPI.companyLogin;

      const credentials = {
        password: formData.password,
        ...(formData.userType === 'employee' 
          ? { employeeEmail: formData.email }
          : { adminEmail: formData.email }
        )
      };

      const response = await loginFunction(credentials);

      if (formData.userType === 'company') {
        const { company, token } = response.data;  // Removed .data since backend returns { company, token } directly
        if (!company || !token) {
          throw new Error('Invalid response from server');
        }
        const userData = {
          _id: company._id,
          name: company.adminName,
          email: company.adminEmail,
          role: 'company'
        };
        // Store both user and company data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('company', JSON.stringify(company));
        dispatch(loginSuccess({ user: userData, token, role: 'company' }));
        navigate('/admin/dashboard');
      } else {
        // Employee login - response structure changed
        const { employee, company, team, token } = response.data;
        if (!employee || !token) {
          throw new Error('Invalid response from server');
        }
        const userData = {
          ...employee,
          role: 'employee',
          team: team?._id
        };
        // Store user and company data in localStorage for employees too
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('company', JSON.stringify(company));
        dispatch(loginSuccess({ user: userData, token, role: 'employee' }));
        navigate('/employee/dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid password. Please try again.');
        clearForm();
      } else if (error.response?.status === 404) {
        setError('Email not found. Please check your email address.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        clearForm();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <WelcomeHeader />
      </div>

      <div className="container mx-auto px-4 py-8">
        <About />

        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
          </div>

          {error && (
            <div className="rounded-md bg-red-900 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
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
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  ref={passwordInputRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
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
