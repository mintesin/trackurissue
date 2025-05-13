import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { teamAPI, employeeAPI } from '../../services/api';
import EmployeeProfile from '../Employee/EmployeeProfile';

const TeamDashboard = () => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        if (user?.team) {
          const response = await teamAPI.getDashboard(user.team);
          setTeamData(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load team dashboard');
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">Loading team dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Team Dashboard
          </h2>
          
          {teamData ? (
            <div className="space-y-6">
              {/* Team Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Team Information</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Team Name: {teamData.teamName}</p>
                  <p className="text-sm text-gray-500">Team Lead: {teamData.teamLead?.name}</p>
                  <p className="text-sm text-gray-500">Members: {teamData.members?.length}</p>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {teamData.members?.map((member) => (
                    <div
                      key={member._id}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <p className="font-medium">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-gray-500">{member.employeeEmail}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Issues */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Active Issues</h3>
                <div className="mt-2">
                  {teamData.activeIssues?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {teamData.activeIssues.map((issue) => (
                        <div
                          key={issue._id}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-gray-500">{issue.description}</p>
                          <p className="text-sm text-gray-500">Status: {issue.status}</p>
                          <p className="text-sm text-gray-500">Priority: {issue.priority}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No active issues</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No team data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
