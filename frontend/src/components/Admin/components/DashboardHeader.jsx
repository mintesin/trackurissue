import React from 'react';

const DashboardHeader = ({ onCreateTeam, onAddEmployee, onCreateIssue }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Company Dashboard</h1>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onCreateTeam}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Create Team
        </button>
        <button
          onClick={onAddEmployee}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Add Employee
        </button>
        <button
          onClick={onCreateIssue}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Create Issue
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
