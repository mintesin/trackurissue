import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div>
            <p className="text-sm">© 2024 Issue Tracker. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a
              href="#"
              className="text-gray-300 hover:text-white text-sm"
              onClick={(e) => {
                e.preventDefault();
                navigate('/documentation');
              }}
            >
              Help & Documentation
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white text-sm"
              onClick={(e) => {
                e.preventDefault();
                navigate('/privacy');
              }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white text-sm"
              onClick={(e) => {
                e.preventDefault();
                navigate('/terms');
              }}
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white text-sm"
              onClick={(e) => {
                e.preventDefault();
                // Add support contact functionality here
              }}
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
