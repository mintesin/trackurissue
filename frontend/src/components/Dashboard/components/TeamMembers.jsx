import React from 'react';

const TeamMembers = ({ members }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Team Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members?.map((member) => (
          <div 
            key={member._id}
            className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-lg">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-gray-300 text-sm truncate">
                {member.isTeamLeader ? 'Team Leader' : 'Member'}
              </p>
            </div>
          </div>
        ))}
        {(!members || members.length === 0) && (
          <p className="text-gray-300 col-span-full text-center py-4">
            No team members yet
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
