import React from 'react';

const TeamsGrid = ({ teams, onDeleteTeam }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Teams</h2>
      <div className="w-full bg-gray-900 bg-opacity-90 rounded-xl border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
        <div className="divide-y divide-gray-700">
          {teams.map((team) => (
            <div key={team._id} className="py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-white">{team.teamName}</h3>
                {team.description && (
                  <p className="mt-1 text-sm text-gray-300">{team.description}</p>
                )}
              </div>
              <button
                onClick={() => onDeleteTeam(team._id)}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
          {teams.length === 0 && (
            <p className="py-4 text-gray-300 text-center">No teams available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsGrid;
