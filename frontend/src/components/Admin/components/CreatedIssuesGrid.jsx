import React from 'react';
import CreatedIssueCard from './CreatedIssueCard';

const CreatedIssuesGrid = ({ issues }) => {
    // Sort issues by creation date (newest first) and urgency
    const sortedIssues = [...issues].sort((a, b) => {
        // First sort by urgency (urgent first)
        if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
        if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
        
        // Then sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return (
        <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">Created Issues</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-gray-200">
                            Total: {issues.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-900 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-red-100">
                            Urgent: {issues.filter(issue => issue.urgency === 'urgent').length}
                        </span>
                    </div>
                </div>
            </div>

            {issues.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                    <p className="text-gray-300">No issues created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedIssues.map((issue) => (
                        <CreatedIssueCard key={issue._id} issue={issue} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreatedIssuesGrid;
