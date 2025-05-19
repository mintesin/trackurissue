import React from 'react';

export const TeamHeaderSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="mb-4 md:mb-0">
        <div className="h-8 w-48 bg-gray-700 rounded"></div>
        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
          <div className="mt-2 flex items-center">
            <div className="h-5 w-5 bg-gray-700 rounded-full mr-1.5"></div>
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
          </div>
          <div className="mt-2 flex items-center">
            <div className="h-5 w-5 bg-gray-700 rounded-full mr-1.5"></div>
            <div className="h-4 w-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
      <div className="flex space-x-3">
        <div className="h-10 w-32 bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);

export const TeamMembersSkeleton = () => (
  <div className="mt-6">
    <div className="h-6 w-32 bg-gray-800 rounded mb-4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-4 flex items-start space-x-3 animate-pulse">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TeamIssuesSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
    <div className="h-6 w-48 bg-gray-700 rounded mb-4"></div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="mb-4 last:mb-0">
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
);

export const TeamChatRoomSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
    <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start space-x-2">
          <div className="h-8 w-8 bg-gray-700 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-700 rounded mb-1"></div>
            <div className="h-3 w-48 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
