/**
 * @fileoverview Team Header Component
 * 
 * This component displays the team header section with key team information
 * and controls. It provides a summary view of team status and leadership.
 * 
 * Features:
 * - Team name display
 * - Team leader information with support for multiple leaders
 * - Member count display
 * - Visual indicators for missing leaders or empty teams
 * - Responsive layout (mobile/desktop)
 * - Team settings access button
 * - SVG icons for visual enhancement
 * 
 * Props:
 * - teamName: String - Name of the team
 * - teamLead: String - Name of team leader(s), may include '+N' suffix for multiple leaders
 * - memberCount: Number - Total number of team members
 * 
 * Technical Details:
 * - Handles multiple team leaders display with tooltip
 * - Responsive design using Tailwind CSS
 * - Conditional styling for warning states
 */

import React from 'react';

const TeamHeader = ({ teamName, teamLead, memberCount }) => {
  const hasMultipleLeaders = teamLead.includes('+');
  const [mainLeader, extraCount] = hasMultipleLeaders 
    ? teamLead.split(' +') 
    : [teamLead, '0'];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-white">
            {teamName || 'Team Dashboard'}
          </h1>
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-300 group relative">
              <svg 
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              <span className={`${mainLeader === 'Not Assigned' ? 'text-yellow-500' : 'text-gray-300'}`}>
                Team Lead: {mainLeader}
                {hasMultipleLeaders && (
                  <span className="ml-1 text-blue-400 cursor-help" title={`+${extraCount} more team leaders`}>
                    +{extraCount}
                  </span>
                )}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-300">
              <svg 
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <span className={`${memberCount === 0 ? 'text-yellow-500' : 'text-gray-300'}`}>
                Members: {memberCount}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              // This will be implemented when we add team settings functionality
              console.log('Team settings clicked');
            }}
          >
            <svg 
              className="-ml-1 mr-2 h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            Team Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
