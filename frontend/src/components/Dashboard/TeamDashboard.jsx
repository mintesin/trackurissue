import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { teamAPI } from '../../services/api';
import TeamHeader from './components/TeamHeader';
import TeamMembers from './components/TeamMembers';
import TeamIssues from './components/TeamIssues';

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">Loading team dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-300">No team data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <TeamHeader 
          teamName={teamData.team.teamName}
          teamLead={teamData.team.members.find(m => m.isTeamLeader)?.firstName || 'N/A'}
          memberCount={teamData.team.members.length}
        />
        <TeamMembers members={teamData.team.members} />
        <TeamIssues issues={teamData.issues} />
      </div>
    </div>
  );
};

export default TeamDashboard;
