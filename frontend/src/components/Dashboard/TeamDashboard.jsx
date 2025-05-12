import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsTeamLeader, selectUser } from '../../store/slices/authSlice';
import { issueAPI, chatAPI } from '../../services/api';

const TeamDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  const isTeamLeader = useSelector(selectIsTeamLeader);
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      // Get assigned issues for all users
      const assignedResponse = await issueAPI.getAssignedIssues();
      let allIssues = assignedResponse.data;

      // If team leader, also get created issues
      if (isTeamLeader) {
        const createdResponse = await issueAPI.getAllIssues();
        allIssues = [...allIssues, ...createdResponse.data];
      }

      setIssues(allIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await issueAPI.createIssue(newIssue);
      setIsCreateIssueModalOpen(false);
      setNewIssue({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
      fetchIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleSolveIssue = async (issueId) => {
    try {
      await issueAPI.solveIssue({ issueId });
      fetchIssues();
    } catch (error) {
      console.error('Error solving issue:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Dashboard</h1>
        {isTeamLeader && (
          <button
            onClick={() => setIsCreateIssueModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Issue
          </button>
        )}
      </div>

      {/* Issues List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <div
            key={issue._id}
            className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{issue.title}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {issue.priority}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{issue.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Due: {new Date(issue.dueDate).toLocaleDateString()}
              </span>
              {!issue.solved && (
                <button
                  onClick={() => handleSolveIssue(issue._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Mark as Solved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Issue Modal */}
      {isCreateIssueModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Issue</h2>
            <form onSubmit={handleCreateIssue}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={newIssue.dueDate}
                    onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateIssueModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
