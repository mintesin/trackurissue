/**
 * @fileoverview Team Issues Component
 * 
 * This component displays a list of issues assigned to a team, with visual
 * indicators for urgency levels and status states. It includes sub-components
 * for rendering status and urgency badges.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../common/Pagination';

const ITEMS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = React.useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(issues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentIssues = issues.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the issues list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="space-y-4">
        {currentIssues.map((issue) => (
          <div 
            key={issue._id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
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
              <div className="flex-shrink-0">
                {issue.status !== 'solved' && (
                  <Link
                    to={`/employee/assigned-issues/${issue._id}/solve`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Solve Issue
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default TeamIssues;
