import React, { useState } from 'react';

const TeamsGrid = ({ teams, onDeleteTeam }) => {
  const [expandedTeam, setExpandedTeam] = useState(null);

  const handleDeleteClick = (teamId, teamName) => {
    if (window.confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
      onDeleteTeam(teamId);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Teams ({teams.length})</h2>
      <div className="w-full bg-gray-900 bg-opacity-90 rounded-xl border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
        <div className="divide-y divide-gray-700">
          {teams.map((team) => (
            <div 
              key={team.id || team._id} 
              className="py-4"
            >
              <div className="flex justify-between items-start">
                <div 
                  className="cursor-pointer flex-grow"
                  onClick={() => setExpandedTeam(expandedTeam === (team.id || team._id) ? null : (team.id || team._id))}
                >
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <span>{team.teamName}</span>
                    <span className="ml-2 text-sm text-gray-400">
                      ({team.memberCount || team.members?.length || 0} members)
                    </span>
                  </h3>
                  {team.description && (
                    <p className="mt-1 text-sm text-gray-300">{team.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(team.id || team._id, team.teamName);
                  }}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
              
              {expandedTeam === (team.id || team._id) && (
                <div className="mt-4 pl-4 border-l-2 border-gray-700">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Team Leaders:</h4>
                    <ul className="list-disc list-inside">
                      {team.teamLeaders?.map(leader => (
                        <li key={leader._id} className="text-sm text-gray-400">
                          {leader.firstName} {leader.lastName}
                        </li>
                      )) || <li className="text-sm text-gray-400">No leaders assigned</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Team Members:</h4>
                    <ul className="list-disc list-inside">
                      {team.members?.map(member => (
                        <li key={member._id} className="text-sm text-gray-400">
                          {member.firstName} {member.lastName}
                          {team.teamLeaders?.some(leader => leader._id === member._id) && 
                            <span className="ml-2 text-xs text-blue-400">(Team Leader)</span>
                          }
                        </li>
                      )) || <li className="text-sm text-gray-400">No members</li>}
                    </ul>
                  </div>
                </div>
              )}
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
