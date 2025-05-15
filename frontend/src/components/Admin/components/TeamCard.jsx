import React from 'react';

const TeamCard = ({ team, onDeleteTeam }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-md">
        <h3 className="font-bold text-xl text-gray-800">{team.teamName}</h3>
        <button
          onClick={() => onDeleteTeam(team._id)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Delete Team
        </button>
      </div>
      <p className="text-gray-600">{team.description}</p>
    </div>
  );
};

export default TeamCard;
