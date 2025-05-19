import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.response) {
      // Server responded with error
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.message || 'Invalid input. Please check your data and try again.';
          break;
        case 401:
          // Clear local storage and reload page on session expiry
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('company');
          errorMessage = 'Session expired. Please login again.';
          window.location.href = '/';
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
      // Request made but no response
      errorMessage = 'Unable to connect to server. Please check your connection.';
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status
    });
  }
);

// Auth API calls
export const authAPI = {
  // Company auth
  companyLogin: (credentials) => api.post('/admin/login', credentials),
  companyRegister: (data) => api.post('/admin/register', data),
  companyRegistrationFields: () => api.get('/admin/register'),
  companyReset: (resetData) => api.post('/admin/reset', resetData),
  companyResetFields: () => api.get('/admin/reset'),

  // Employee auth
  employeeLogin: (credentials) => api.post('/employee/login', credentials),
  employeeReset: (resetData) => api.post('/employee/reset', resetData),
  employeeResetFields: () => api.get('/employee/reset'),
  employeeRegistrationFields: () => api.get('/admin/employee/register'),
};

// Company/Admin API calls
export const companyAPI = {
  getDashboard: () => api.get('/admin'),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (profileData) => api.put('/admin/profile', profileData),
  
  // Team management
  getTeamCreationForm: () => api.get('/admin/team'),
  createTeam: (teamData) => api.post('/admin/team', teamData),
  getTeamDeletionForm: (teamId) => api.get(`/admin/team/${teamId}`),
  deleteTeam: (teamId) => api.delete(`/admin/team/${teamId}`),
  
  // Team member management
  getAddMemberForm: (teamId) => api.get(`/admin/team/${teamId}/member`),
  addTeamMember: (teamId, memberData) => api.post(`/admin/team/${teamId}/member`, memberData),
  getRemoveMemberForm: (teamId, employeeId) => api.get(`/admin/team/${teamId}/member/${employeeId}`),
  removeTeamMember: (teamId, employeeId) => api.delete(`/admin/team/${teamId}/member/${employeeId}`),
  
  // Employee management
  registerEmployee: (employeeData) => api.post('/admin/employee/register', employeeData),
  deregisterEmployee: (employeeId) => api.delete(`/admin/employee/${employeeId}`),
};

// Employee API calls
export const employeeAPI = {
  // Profile management
  getProfile: (employeeId) => api.get(`/employee/profile/${employeeId}`),
  updateProfile: (employeeId, profileData) => api.put(`/employee/profile/${employeeId}`, profileData),
  
  // Issue management
  getAssignedIssues: () => api.get('/employee/assigned-issues'),
  getIssueToSolve: (issueId) => api.get(`/employee/assigned-issues/${issueId}/solve`),
  solveIssue: (issueId, solutionData) => api.post(`/employee/assigned-issues/${issueId}/solve`, solutionData),
};

// Team API calls
export const teamAPI = {
  getDashboard: async (teamId) => {
    const response = await api.get(`/team/${teamId}`);
    console.log('Dashboard API response:', response);
    return response;
  },
  getMembers: async (teamId) => {
    const response = await api.get(`/team/${teamId}/members`);
    console.log('Members API response:', response);
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : []
    };
  },
  addMember: (teamId, employeeId) => api.post(`/team/${teamId}/members`, { employeeId }),
  removeMember: (teamId, employeeId) => api.delete(`/team/${teamId}/members/${employeeId}`),
};

// Chat Room API calls
export const chatAPI = {
  createChatRoom: (teamId, participants) => 
    api.post('/chat/room', { teamId, participants }),
  
  getChatRoom: (roomId, page = 1, limit = 50) => 
    api.get(`/chat/room/${roomId}`, { params: { page, limit } }),
  
  sendMessage: (roomId, content) => 
    api.post(`/chat/room/${roomId}/message`, { content }),
  
  markAsRead: (roomId) => 
    api.put(`/chat/room/${roomId}/read`),
  
  getUnreadCount: (roomId) => 
    api.get(`/chat/room/${roomId}/unread`)
};

export default api;
