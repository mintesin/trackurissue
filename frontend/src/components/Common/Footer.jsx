import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">© 2024 Issue Tracker. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-300 hover:text-white text-sm"
              onClick={(e) => {
                e.preventDefault();
                // Add help/documentation functionality here
              }}
            >
              Help & Documentation
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
