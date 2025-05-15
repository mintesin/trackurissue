import React from 'react';

const DashboardHeader = ({ onCreateTeam, onAddEmployee, onCreateIssue }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Company Dashboard</h1>
      <div className="space-x-4">
        <button
          onClick={onCreateTeam}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Team
        </button>
        <button
          onClick={onAddEmployee}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Employee
        </button>
        <button
          onClick={onCreateIssue}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Issue
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
