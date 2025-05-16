import React from 'react';
import { Link } from 'react-router-dom';

const WelcomeHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Track UR Issue</h1>
        <span className="ml-4 text-gray-400">Issue Tracking Made Simple</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Register Company
        </Link>
      </div>
    </div>
  );
};

export default WelcomeHeader;
