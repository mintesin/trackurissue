import React from 'react';

const DashboardHeader = ({ onCreateTeam, onAddEmployee, onCreateIssue }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Company Dashboard</h1>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onCreateTeam}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 text-lg"
        >
          <span role="img" aria-label="team">👥</span> Create Team
        </button>
        <button
          onClick={onAddEmployee}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 focus:ring-2 focus:ring-green-300 focus:ring-offset-2 text-lg"
        >
          <span role="img" aria-label="employee">➕</span> Add Employee
        </button>
        <button
          onClick={onCreateIssue}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 text-lg"
        >
          <span role="img" aria-label="issue">🐞</span> Create Issue
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
