import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'employee'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

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

      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token,
        role: formData.userType === 'employee' 
          ? response.data.isTeamLeader ? 'teamLeader' : 'employee'
          : 'company'
      }));

      if (formData.userType === 'company') {
        navigate('/company-dashboard');
      } else {
        navigate('/team-dashboard');
      }

    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
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
                id="password"
                name="password"
                type="password"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
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
