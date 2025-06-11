import React, { useState } from 'react';

const TeamsGrid = ({ teams, onDeleteTeam, onAssignLeader }) => {
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [assigningTeamId, setAssigningTeamId] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const handleDeleteClick = (teamId, teamName) => {
    if (window.confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
      onDeleteTeam(teamId);
    }
  };

  const handleAssignLeader = async (teamId) => {
    if (!selectedLeader) return;
    setAssignLoading(true);
    await onAssignLeader(teamId, selectedLeader);
    setAssignLoading(false);
    setAssigningTeamId(null);
    setSelectedLeader('');
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssigningTeamId(team.id || team._id);
                      setSelectedLeader('');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Assign Leader
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(team.id || team._id, team.teamName);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {assigningTeamId === (team.id || team._id) && (
                <div className="mt-2 flex items-center space-x-2">
                  <select
                    value={selectedLeader}
                    onChange={e => setSelectedLeader(e.target.value)}
                    className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                  >
                    <option value="">Select member</option>
                    {team.members?.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignLeader(team.id || team._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    disabled={!selectedLeader || assignLoading}
                  >
                    {assignLoading ? 'Assigning...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setAssigningTeamId(null)}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
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
