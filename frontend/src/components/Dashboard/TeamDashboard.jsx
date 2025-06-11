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

// Number of issues to display per page
const ITEMS_PER_PAGE = 5;

/**
 * TeamDashboard component
 * Main dashboard for team members, showing team info, issues, and chat.
 */
const TeamDashboard = () => {
  // State for team data, assigned issues, loading/error status, chat room, and pagination
  const [teamData, setTeamData] = useState(null);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Get current user from Redux store
  const user = useSelector(state => state.auth.user);

  // Fetch team dashboard data and initialize chat room on mount or when user changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ensure user has a team
        if (!user?.team) {
          throw new Error('No team assigned');
        }

        // Fetch dashboard data for the user's team
        const response = await teamAPI.getDashboard(user.team);
        
        if (!response?.data?.team?._id) {
          throw new Error('Invalid team data received');
        }

        const teamData = response.data;
        setTeamData(teamData);
        
        // Extract issues assigned to the team
        const issues = teamData.issues || [];
        setAssignedIssues(issues);

        // Initialize chat room for the team
        const initializeChatRoom = async () => {
          try {
            const teamMembers = teamData.team.members;
            // Create a chat room for the team with all member IDs
            const createResponse = await chatAPI.createChatRoom(
              teamData.team._id,
              teamMembers.map(member => member._id)
            );
            
            if (!createResponse?.data?._id) {
              console.error('Chat room creation response missing _id:', createResponse);
              setChatRoom(null);
              return;
            }
            // Fetch chat room details
            const chatRoomResponse = await chatAPI.getChatRoom(createResponse.data._id);
            if (!chatRoomResponse?.data?._id) {
              console.error('Chat room details response missing _id:', chatRoomResponse);
              setChatRoom(null);
              return;
            }
            setChatRoom(chatRoomResponse.data);
          } catch (chatError) {
            // Handle chat room initialization errors
            console.error('Chat room initialization error:', chatError);
            setChatRoom(null);
          }
        };

        await initializeChatRoom();
        setLoading(false);
        setError(null);
      } catch (err) {
        // Handle errors in fetching dashboard data
        console.error('Team dashboard error:', err);
        setError(err.message || 'Failed to load team dashboard');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate pagination for issues
  const totalPages = Math.ceil(assignedIssues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentIssues = assignedIssues.slice(startIndex, endIndex);

  // Handle page change for pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading skeletons while data is loading
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

  // Show error message if there was an error loading data
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

  // Show message if no team data is available
  if (!teamData?.team) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-300">No team data available</div>
      </div>
    );
  }

  // Main dashboard UI
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Team header with team name, lead, and member count */}
          <TeamHeader 
            teamName={teamData.team.teamName}
            teamLead={(() => {
              // Display team leader(s) or 'Not Assigned' if none
              const leaders = teamData.team.members?.filter(m => m.isTeamLeader) || [];
              if (leaders.length > 0) {
                const displayName = `${leaders[0].firstName} ${leaders[0].lastName}`;
                return leaders.length > 1 ? `${displayName} +${leaders.length - 1}` : displayName;
              }
              return 'Not Assigned';
            })()}
            memberCount={teamData.team.members?.length || 0}
          />
          {/* List of team members */}
          <TeamMembers members={teamData.team.members} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Assigned issues section with pagination */}
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
            {/* Team chat room section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">Team Chat Room</h2>
              <TeamChatRoom 
                teamId={teamData.team._id}
                chatRoomId={chatRoom?._id}
                isLoading={loading}
                onParticipantsChange={(participants) => {
                  // Update active participants count in team data
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
