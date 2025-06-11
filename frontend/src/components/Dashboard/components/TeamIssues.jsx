/**
 * @fileoverview Team Issues Component
 * 
 * This component displays a list of issues assigned to a team, with visual
 * indicators for urgency levels and status states. It includes sub-components
 * for rendering status and urgency badges.
 */

import React from 'react'; // Import React for component creation and hooks
import { Link } from 'react-router-dom'; // Import Link for navigation
import Pagination from '../../common/Pagination'; // Import Pagination component

// Number of issues to display per page
const ITEMS_PER_PAGE = 5;

// Badge component to visually indicate urgency level
const UrgencyBadge = ({ urgency }) => {
  const colors = {
    high: 'bg-red-900 text-red-200', // High urgency: red
    normal: 'bg-yellow-900 text-yellow-200', // Normal urgency: yellow
    low: 'bg-green-900 text-green-200' // Low urgency: green
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[urgency] || colors.normal}`}>
      {/* Capitalize first letter of urgency */}
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
    </span>
  );
};

// Badge component to visually indicate issue status
const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-900 text-yellow-200', // Pending: yellow
    inprogress: 'bg-blue-900 text-blue-200', // In progress: blue
    completed: 'bg-green-900 text-green-200', // Completed: green
    cancelled: 'bg-red-900 text-red-200' // Cancelled: red
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.pending}`}>
      {/* Capitalize first letter of status */}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Main component to display a paginated list of team issues
const TeamIssues = ({ issues = [] }) => {
  // State to track the current page in pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  
  // Calculate pagination values
  const totalPages = Math.ceil(issues.length / ITEMS_PER_PAGE); // Total number of pages
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; // Start index for current page
  const endIndex = startIndex + ITEMS_PER_PAGE; // End index for current page
  const currentIssues = issues.slice(startIndex, endIndex); // Issues to display on current page

  // Handle page change event from Pagination component
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the issues list for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* List of issues for the current page */}
      <div className="space-y-4">
        {currentIssues.map((issue) => (
          <div 
            key={issue._id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {/* Issue topic/title */}
                <h3 className="text-lg font-medium text-white truncate">
                  {issue.topic}
                </h3>
                {/* Issue description */}
                <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                  {issue.description}
                </p>
                {/* Badges and assignment info */}
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
                {/* Show Solve Issue button if not solved */}
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
      
      {/* Pagination controls if more than one page */}
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

// Export the TeamIssues component as default
export default TeamIssues;
