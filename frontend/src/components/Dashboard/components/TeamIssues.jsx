import React from 'react';

const TeamIssues = ({ issues }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Assigned Issues</h2>
      <div className="space-y-4">
        {issues?.map((issue) => (
          <div 
            key={issue._id}
            className="bg-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium">{issue.topic}</h3>
              <span className={`${getPriorityColor(issue.urgency)} px-2 py-1 rounded text-xs text-white`}>
                {issue.urgency}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              {issue.description}
            </p>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Assigned: {new Date(issue.assignedAt).toLocaleDateString()}</span>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
        {(!issues || issues.length === 0) && (
          <p className="text-gray-300 text-center py-4">
            No issues assigned to the team
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamIssues;
