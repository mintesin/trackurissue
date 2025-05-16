import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">About Track UR Issue</h2>
      <div className="space-y-4 text-gray-300">
        <p>
          Track UR Issue is a comprehensive issue tracking system designed to help companies efficiently manage and resolve internal issues. Our platform streamlines the process of issue reporting, assignment, and resolution across teams.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Issue Management</h3>
            <p className="text-sm">Create, track, and manage issues with ease. Assign priorities and monitor progress in real-time.</p>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
            <p className="text-sm">Foster teamwork with dedicated team spaces and real-time communication features.</p>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Progress Tracking</h3>
            <p className="text-sm">Monitor issue resolution progress and team performance through intuitive dashboards.</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Why Choose Track UR Issue?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Streamlined issue management workflow</li>
            <li>Real-time collaboration features</li>
            <li>Secure and reliable platform</li>
            <li>Customizable team structures</li>
            <li>Comprehensive reporting and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
