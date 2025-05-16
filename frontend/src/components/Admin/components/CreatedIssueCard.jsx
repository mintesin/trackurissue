import React from 'react';
import { Link } from 'react-router-dom';

const CreatedIssueCard = ({ issue }) => {
    // Format date to be more readable
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get appropriate status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'created':
                return 'bg-blue-900 text-blue-200';
            case 'assigned':
                return 'bg-yellow-900 text-yellow-200';
            case 'edited':
                return 'bg-purple-900 text-purple-200';
            case 'solved':
                return 'bg-green-900 text-green-200';
            default:
                return 'bg-gray-800 text-gray-200';
        }
    };

    // Get urgency color
    const getUrgencyColor = (urgency) => {
        return urgency === 'urgent' 
            ? 'bg-red-900 text-red-200' 
            : 'bg-gray-800 text-gray-200';
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-4 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{issue.topic}</h3>
                <div className={`px-2 py-1 rounded-full text-sm ${getUrgencyColor(issue.urgency)}`}>
                    {issue.urgency === 'urgent' ? 'Urgent' : 'Not Urgent'}
                </div>
            </div>
            
            <p className="text-gray-300 mb-3 line-clamp-2 hover:line-clamp-none cursor-pointer transition-all duration-200">
                {issue.description}
            </p>
            
            <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(issue.status)}`}>
                        {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                        Created: {formatDate(issue.createdAt)}
                    </span>
                </div>
                
                <div className="flex gap-2">
                    <Link 
                        to={`/admin/issues/${issue._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                    {issue.status === 'created' && (
                        <Link 
                            to={`/admin/issues/${issue._id}/assign`}
                            className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            Assign
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatedIssueCard;
