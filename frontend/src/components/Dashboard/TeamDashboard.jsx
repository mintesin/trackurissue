/**
 * @fileoverview Team Dashboard Component
 * 
 * This component serves as the main dashboard for team members, providing a comprehensive
 * view of team activities, assigned issues, and communication features.
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { teamAPI, chatAPI } from '../../services/api';
import TeamHeader from './components/TeamHeader';
import TeamMembers from './components/TeamMembers';
import TeamIssues from './components/TeamIssues';
import TeamChatRoom from './components/TeamChatRoom';
import ErrorBoundary from '../Common/ErrorBoundary';
import Pagination from '../common/Pagination';
import { TeamHeaderSkeleton, TeamMembersSkeleton, TeamIssuesSkeleton, TeamChatRoomSkeleton } from './components/Skeletons';

const ITEMS_PER_PAGE = 5;

const TeamDashboard = () => {
  const [teamData, setTeamData] = useState(null);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.team) {
          throw new Error('No team assigned');
        }

        const response = await teamAPI.getDashboard(user.team);
        
        if (!response?.data?.team?._id) {
          throw new Error('Invalid team data received');
        }

        const teamData = response.data;
        setTeamData(teamData);
        
        const issues = teamData.issues || [];
        setAssignedIssues(issues);

        // Initialize chat room
        const initializeChatRoom = async () => {
          try {
            const teamMembers = teamData.team.members;
            
            const createResponse = await chatAPI.createChatRoom(
              teamData.team._id,
              teamMembers.map(member => member._id)
            );
            
            if (!createResponse?.data?._id) {
              console.error('Chat room creation response missing _id:', createResponse);
              setChatRoom(null);
              return;
            }
            
            const chatRoomResponse = await chatAPI.getChatRoom(createResponse.data._id);
            if (!chatRoomResponse?.data?._id) {
              console.error('Chat room details response missing _id:', chatRoomResponse);
              setChatRoom(null);
              return;
            }
            setChatRoom(chatRoomResponse.data);
          } catch (chatError) {
            console.error('Chat room initialization error:', chatError);
            setChatRoom(null);
          }
        };

        await initializeChatRoom();
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Team dashboard error:', err);
        setError(err.message || 'Failed to load team dashboard');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate pagination
  const totalPages = Math.ceil(assignedIssues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentIssues = assignedIssues.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <TeamHeaderSkeleton />
          <TeamMembersSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TeamIssuesSkeleton />
            <TeamChatRoomSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!teamData?.team) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-300">No team data available</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <TeamHeader 
            teamName={teamData.team.teamName}
            teamLead={(() => {
              const leaders = teamData.team.members?.filter(m => m.isTeamLeader) || [];
              if (leaders.length > 0) {
                const displayName = `${leaders[0].firstName} ${leaders[0].lastName}`;
                return leaders.length > 1 ? `${displayName} +${leaders.length - 1}` : displayName;
              }
              return 'Not Assigned';
            })()}
            memberCount={teamData.team.members?.length || 0}
          />
          <TeamMembers members={teamData.team.members} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Assigned Issues ({assignedIssues.length})
              </h2>
              {assignedIssues.length > 0 ? (
                <>
                  <TeamIssues 
                    issues={currentIssues.map(assignedIssue => ({
                      _id: assignedIssue._id,
                      topic: assignedIssue.issue?.topic || 'No Topic',
                      description: assignedIssue.issue?.description || 'No Description',
                      urgency: assignedIssue.issue?.urgency || 'normal',
                      status: assignedIssue.status || 'pending',
                      assignedAt: assignedIssue.assignedAt,
                      assignee: assignedIssue.assignee || { firstName: 'Unassigned', lastName: '' }
                    }))} 
                  />
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-center py-4">
                  No issues assigned to team
                </div>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">Team Chat Room</h2>
              <TeamChatRoom 
                teamId={teamData.team._id}
                chatRoomId={chatRoom?._id}
                isLoading={loading}
                onParticipantsChange={(participants) => {
                  setTeamData(prev => ({
                    ...prev,
                    team: {
                      ...prev.team,
                      activeParticipants: participants.size
                    }
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TeamDashboard;
