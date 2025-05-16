import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // adjust based on your backend URL

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
          errorMessage = 'Invalid input. Please check your data and try again.';
          break;
        case 401:
          errorMessage = 'Please login to continue.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = 'This resource already exists.';
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
  companyLogin: (credentials) => {
    return api.post('/admin/login', credentials);
  },
  companyRegister: (data) => api.post('/admin/register', data),
  companyRegistrationFields: () => api.get('/admin/register'),
  companyReset: (resetData) => api.post('/admin/reset', resetData),
  companyResetFields: () => api.get('/admin/reset'),

  // Employee auth
  employeeLogin: (credentials) => api.post('/user/login', credentials),
  employeeReset: (resetData) => api.post('/user/reset', resetData),
  employeeResetFields: () => api.get('/user/reset'),
  employeeRegistrationFields: () => api.get('/admin/employee/register'),
};

// Company/Admin API calls
export const companyAPI = {
  getDashboard: () => api.get('/admin'),
  getProfile: () => api.get('/admin').then(response => ({ data: response.data.company })),
  updateProfile: (profileData) => api.put('/admin/profile', profileData),
  
  // Team management
  getTeamCreationForm: () => api.get('/admin/team'),
  createTeam: (teamData) => {
    const { teamName, description } = teamData;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentCompany = JSON.parse(localStorage.getItem('company'));

    if (!currentUser?._id || !currentCompany?._id) {
      return Promise.reject({
        message: 'User or company information missing. Please log in again.',
        status: 400
      });
    }

    const formattedData = {
      teamName,
      description,
      teamAdmin: currentUser._id,
      company: currentCompany._id
    };

    return api.post('/admin/team', formattedData);
  },
  getTeamDeletionForm: (teamId) => api.get(`/admin/team/${teamId}`),
  deleteTeam: (teamId) => api.delete(`/admin/team/${teamId}`),
  
  // Team member management
  getAddMemberForm: (teamId) => api.get(`/admin/team/${teamId}/member`),
  addTeamMember: (teamId, memberData) => api.post(`/admin/team/${teamId}/member`, memberData),
  getRemoveMemberForm: (teamId, employeeId) => api.get(`/admin/team/${teamId}/member/${employeeId}`),
  removeTeamMember: (teamId, employeeId) => api.delete(`/admin/team/${teamId}/member/${employeeId}`),
  registerEmployee: (employeeData) => api.post('/admin/employee/register', employeeData),
  deregisterEmployee: (employeeId) => api.delete(`/admin/employee/${employeeId}`),
  
  // Issue management
  getIssues: () => api.get('/admin/issues'),
  createIssue: (issueData) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentCompany = JSON.parse(localStorage.getItem('company'));

    if (!currentUser?._id || !currentCompany?._id) {
      return Promise.reject({
        message: 'User or company information missing. Please log in again.',
        status: 400
      });
    }

    const formattedData = {
      ...issueData,
      company: currentCompany._id,
      createdBy: currentUser._id
    };

    return api.post('/admin/issues', formattedData);
  },
  getIssueFields: () => api.get('/admin/issues/create'),
  getIssue: (issueId) => {
    if (!issueId) {
      return Promise.reject({ message: 'Issue ID is required' });
    }
    return api.get(`/admin/issues/${issueId}`);
  },
  updateIssue: (issueId, issueData) => api.put(`/admin/issues/${issueId}`, issueData),
  deleteIssue: (issueId) => api.delete(`/admin/issues/${issueId}`),
  getAssignIssueForm: (issueId) => api.get(`/admin/issues/${issueId}/assign`),
  assignIssue: (issueId, teamId) => {
    if (!issueId || !teamId) {
      return Promise.reject({ message: 'Issue ID and Team ID are required' });
    }
    return api.post(`/admin/issues/${issueId}/assign`, {
      assigneeId: teamId
    });
  },
};

// Employee API calls
export const employeeAPI = {
  // Profile management
  getProfile: (employeeId) => api.get(`/user/profile/${employeeId}`),
  updateProfile: (employeeId, profileData) => api.put(`/user/profile/${employeeId}`, profileData),
  
  // Chat room management
  getChatRoom: (roomId) => api.get(`/user/chat/${roomId}`),
  sendMessage: (roomId, message) => api.post(`/user/chat/${roomId}`, { message }),
  
  // Issue management
  getAssignedIssues: () => api.get('/user/assigned-issues'),
  getIssueToSolve: (issueId) => api.get(`/user/assigned-issues/${issueId}/solve`),
  solveIssue: (issueId, solutionData) => api.post(`/user/assigned-issues/${issueId}/solve`, solutionData),
};

// Team API calls
export const teamAPI = {
  getDashboard: (teamId) => api.get(`/user/team/${teamId}`),
  getMembers: (teamId) => api.get(`/user/team/${teamId}/members`),
};

export default api;
