/**
 * @fileoverview API Service Configuration
 * 
 * This module configures and exports API service instances for different parts of the application.
 * It sets up axios with interceptors for authentication and error handling, and provides
 * organized API call methods for different entities (auth, company, employee, team, chat).
 * 
 * Features:
 * - Centralized API configuration
 * - Automatic token management
 * - Comprehensive error handling
 * - Organized API endpoints by entity
 * - Type-safe API responses
 */

import axios from 'axios';

/** Base URL for all API requests */
const BASE_URL = 'http://localhost:5000/api';

/**
 * Create axios instance with default configuration
 * Sets base URL and default headers for all requests
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for authentication
 * Automatically adds authentication token to requests if available
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor for error handling
 * Provides consistent error handling across all API calls
 * 
 * @param {Object} response - Successful response object
 * @param {Object} error - Error object from failed request
 * @returns {Promise} Resolved with response or rejected with error
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.response) {
      // Handle different types of server responses
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.message || 'Invalid input. Please check your data and try again.';
          break;
        case 401:
          const token = localStorage.getItem('token');
          if (token) {
            // Handle session expiry
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('company');
            errorMessage = 'Session expired. Please login again.';
            window.location.href = '/';
          } else {
            // Handle login failures
            errorMessage = error.response.data?.message || 'Invalid credentials';
          }
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = error.response.data?.message || 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = error.response.data?.message || 'This resource already exists.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      // Handle network errors
      errorMessage = 'Unable to connect to server. Please check your connection.';
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status
    });
  }
);

/**
 * Authentication API endpoints
 * Handles all authentication-related operations for both companies and employees
 */
export const authAPI = {
  /** Company authentication endpoints */
  companyLogin: (credentials) => api.post('/admin/login', credentials),
  companyRegister: (data) => api.post('/admin/register', data),
  companyRegistrationFields: () => api.get('/admin/register'),
  companyReset: (resetData) => api.post('/admin/reset', resetData),
  companyResetFields: () => api.get('/admin/reset'),

  /** Employee authentication endpoints */
  employeeLogin: (credentials) => api.post('/employee/login', credentials),
  employeeReset: (resetData) => api.post('/employee/reset', resetData),
  employeeResetFields: () => api.get('/employee/reset'),
  employeeRegistrationFields: () => api.get('/admin/employee/register'),
};

/**
 * Company/Admin API endpoints
 * Handles all company administration operations including team, employee, and issue management
 */
export const companyAPI = {
  /** Dashboard and profile management */
  getDashboard: () => api.get('/admin'),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (profileData) => api.put('/admin/profile', profileData),
  
  /** Team management operations */
  getTeamCreationForm: () => api.get('/admin/team'),
  createTeam: (teamData) => api.post('/admin/team', teamData),
  getTeamDeletionForm: (teamId) => api.get(`/admin/team/${teamId}`),
  deleteTeam: (teamId) => api.delete(`/admin/team/${teamId}`),
  
  /** Team member management operations */
  getAddMemberForm: (teamId) => api.get(`/admin/team/${teamId}/member`),
  addTeamMember: (teamId, memberData) => api.post(`/admin/team/${teamId}/member`, memberData),
  getRemoveMemberForm: (teamId, employeeId) => api.get(`/admin/team/${teamId}/member/${employeeId}`),
  removeTeamMember: (teamId, employeeId) => api.delete(`/admin/team/${teamId}/member/${employeeId}`),
  
  /** Employee management operations */
  registerEmployee: (employeeData) => api.post('/admin/employee/register', employeeData),
  deregisterEmployee: (employeeId) => api.delete(`/admin/employee/${employeeId}`),
  
  /** Issue management operations */
  getIssueFields: () => api.get('/admin/issues/create'),
  createIssue: (issueData) => api.post('/admin/issues', issueData),
  getIssue: (issueId) => api.get(`/admin/issues/${issueId}`),
  deleteIssue: (issueId) => api.delete(`/admin/issues/${issueId}`),
  assignIssue: (issueId, assigneeId) => api.post(`/admin/issues/${issueId}/assign`, { assigneeId }),
  updateIssue: (issueId, issueData) => api.put(`/admin/issues/${issueId}`, issueData),
};

/**
 * Employee API endpoints
 * Handles employee-specific operations including profile and issue management
 */
export const employeeAPI = {
  /** Profile management operations */
  getProfile: (employeeId) => api.get(`/employee/profile/${employeeId}`),
  updateProfile: (employeeId, profileData) => api.put(`/employee/profile/${employeeId}`, profileData),
  
  /** Issue management operations */
  getAssignedIssues: () => api.get('/employee/assigned-issues'),
  getIssueToSolve: (issueId) => api.get(`/employee/assigned-issues/${issueId}/solve`),
  solveIssue: (issueId, solutionData) => api.post(`/employee/assigned-issues/${issueId}/solve`, solutionData),
};

/**
 * Team API endpoints
 * Handles team-specific operations including member management and dashboard data
 */
export const teamAPI = {
  /** Get team dashboard data */
  getDashboard: async (teamId) => {
    const response = await api.get(`/team/${teamId}`);
    console.log('Dashboard API response:', response);
    return response;
  },
  
  /** Get team members with data validation */
  getMembers: async (teamId) => {
    const response = await api.get(`/team/${teamId}/members`);
    console.log('Members API response:', response);
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : []
    };
  },
  
  /** Team member management operations */
  addMember: (teamId, employeeId) => api.post(`/team/${teamId}/members`, { employeeId }),
  removeMember: (teamId, employeeId) => api.delete(`/team/${teamId}/members/${employeeId}`),

  /** Assign leader to team */
  assignLeader: (teamId, employeeId) => api.post(`/admin/team/${teamId}/assign-leader`, { employeeId }),
};

/**
 * Chat Room API endpoints
 * Handles real-time chat functionality including room management and messaging
 */
export const chatAPI = {
  /** Create a new chat room */
  createChatRoom: (teamId, participants) => 
    api.post('/chat/room', { teamId, participants }),
  
  /** Get chat room messages with pagination */
  getChatRoom: (roomId, page = 1, limit = 50) => 
    api.get(`/chat/room/${roomId}`, { params: { page, limit } }),
  
  /** Send a new message in a chat room */
  sendMessage: (roomId, content) => 
    api.post(`/chat/room/${roomId}/message`, { content }),
  
  /** Mark messages as read */
  markAsRead: (roomId) => 
    api.put(`/chat/room/${roomId}/read`),
  
  /** Get count of unread messages */
  getUnreadCount: (roomId) => 
    api.get(`/chat/room/${roomId}/unread`)
};

export default api;
