/**
 * @fileoverview Team Members Component
 * 
 * This component displays a grid of team members with their roles and status.
 * It provides visual distinction between team leaders and regular members.
 * 
 * Features:
 * - Grid layout with responsive design
 * - Visual indicators for team leaders (blue ring and background)
 * - Role badges (Team Leader, Admin)
 * - Member avatars with initials
 * - Empty state handling
 * - Automatic sorting (team leaders first)
 * 
 * Props:
 * - members: Array - List of team members with their details
 *   - _id: String - Unique identifier
 *   - firstName: String - First name
 *   - lastName: String - Last name
 *   - email: String - Email address
 *   - isTeamLeader: Boolean - Leadership status
 *   - authorization: String - Role (e.g., 'admin')
 */

import React from 'react';

const TeamMembers = ({ members = [] }) => {
  // Sort members so team leaders appear first in the list
  const sortedMembers = [...members].sort((a, b) => {
    if (a.isTeamLeader && !b.isTeamLeader) return -1;
    if (!a.isTeamLeader && b.isTeamLeader) return 1;
    return 0;
  });

  return (
    <div className="mt-6">
      {/* Section title */}
      <h3 className="text-lg font-medium text-white mb-4">Team Members</h3>
      {/* Responsive grid for team member cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedMembers.map((member) => (
          // Card for each team member
          <div
            key={member._id}
            className={`bg-gray-800 rounded-lg p-4 flex items-start space-x-3 ${
              member.isTeamLeader ? 'ring-2 ring-blue-500' : '' // Highlight team leaders with a blue ring
            }`}
          >
            <div className="flex-shrink-0">
              {/* Avatar with initials, blue background for leaders */}
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                member.isTeamLeader ? 'bg-blue-700' : 'bg-gray-700'
              }`}>
                <span className="text-lg text-white">
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {/* Member name */}
              <p className="text-sm font-medium text-white truncate">
                {member.firstName} {member.lastName}
              </p>
              {/* Member email */}
              <p className="text-sm text-gray-400 truncate">{member.email}</p>
              {/* Badge for team leader */}
              {member.isTeamLeader && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-200 mt-1">
                  Team Leader
                </span>
              )}
              {/* Badge for admin role */}
              {member.authorization === 'admin' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900 text-purple-200 mt-1 ml-1">
                  Admin
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Empty state if there are no members */}
      {members.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          No team members found
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
