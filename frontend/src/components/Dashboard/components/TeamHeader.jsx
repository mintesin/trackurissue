import React from 'react';

const TeamHeader = ({ teamName, teamLead, memberCount }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{teamName}</h1>
          <p className="text-gray-300">Team Lead: {teamLead}</p>
          <p className="text-gray-300">Members: {memberCount}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            View Team Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
