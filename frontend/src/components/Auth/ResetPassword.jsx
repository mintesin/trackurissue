import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    userType: 'employee' // or 'company'
  });
  const [status, setStatus] = useState({ message: '', isError: false });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', isError: false });

    try {
      const resetFunction = formData.userType === 'employee' 
        ? authAPI.employeeReset 
        : authAPI.companyReset;

      await resetFunction(formData.email);
      
      setIsSubmitted(true);
      setStatus({
        message: 'Password reset instructions have been sent to your email',
        isError: false
      });
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || 'Failed to reset password',
        isError: true
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
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

            {status.message && (
              <div className={`text-sm text-center ${status.isError ? 'text-red-500' : 'text-green-500'}`}>
                {status.message}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Password
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="text-center text-green-500">
              {status.message}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Login
            </button>
          </div>
        )}

        <div className="text-sm text-center">
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
