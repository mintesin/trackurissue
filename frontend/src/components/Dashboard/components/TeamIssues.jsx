/**
 * @fileoverview Team Issues Component
 * 
 * This component displays a list of issues assigned to a team, with visual
 * indicators for urgency levels and status states. It includes sub-components
 * for rendering status and urgency badges.
 * 
 * Features:
 * - List of assigned issues with details
 * - Color-coded urgency badges (high/normal/low)
 * - Status indicators (pending/inprogress/completed/cancelled)
 * - Assignee information display
 * - Assignment date tracking
 * - Responsive card layout
 * - Hover effects for better UX
 * 
 * Props:
 * - issues: Array - List of issue objects with properties:
 *   - _id: String - Unique identifier
 *   - topic: String - Issue title
 *   - description: String - Issue details
 *   - urgency: String - Priority level ('high'/'normal'/'low')
 *   - status: String - Current state
 *   - assignee: Object - Assigned team member details
 *   - assignedAt: Date - Assignment timestamp
 * 
 * Sub-components:
 * - UrgencyBadge: Displays priority level with appropriate styling
 * - StatusBadge: Shows current status with color coding
 */

import React from 'react';

const UrgencyBadge = ({ urgency }) => {
  const colors = {
    high: 'bg-red-900 text-red-200',
    normal: 'bg-yellow-900 text-yellow-200',
    low: 'bg-green-900 text-green-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[urgency] || colors.normal}`}>
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-900 text-yellow-200',
    inprogress: 'bg-blue-900 text-blue-200',
    completed: 'bg-green-900 text-green-200',
    cancelled: 'bg-red-900 text-red-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const TeamIssues = ({ issues = [] }) => {
  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div 
          key={issue._id}
          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white truncate">
                {issue.topic}
              </h3>
              <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                {issue.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <UrgencyBadge urgency={issue.urgency} />
                <StatusBadge status={issue.status} />
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                  Assigned to: {`${issue.assignee.firstName} ${issue.assignee.lastName}`}
                </span>
                {issue.assignedAt && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                    Assigned: {new Date(issue.assignedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamIssues;
