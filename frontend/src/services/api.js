import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // adjust based on your backend URL

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

// Auth API calls
export const authAPI = {
  // Company auth
  companyLogin: (credentials) => api.post('/login', credentials),
  companyRegister: (data) => api.post('/register', data),
  companyReset: (email) => api.post('/reset', { email }),

  // Employee auth
  employeeLogin: (credentials) => api.post('/employee/login', credentials),
  employeeReset: (email) => api.post('/employee/reset', { email }),
};

// Company/Admin API calls
export const companyAPI = {
  getDashboard: () => api.get('/'),
  createTeam: (teamData) => api.post('/team', teamData),
  deleteTeam: (teamId) => api.delete(`/team/${teamId}`),
  addTeamMember: (memberData) => api.post('/team/member', memberData),
  removeTeamMember: (memberData) => api.delete('/team/member', { data: memberData }),
  registerEmployee: (employeeData) => api.post('/employee', employeeData),
};

// Issue API calls
export const issueAPI = {
  // For Team Leaders
  createIssue: (issueData) => api.post('/issues', issueData),
  getAllIssues: () => api.get('/issues'),
  getIssue: (issueId) => api.get(`/issues/${issueId}`),
  updateIssue: (issueId, issueData) => api.put(`/issues/${issueId}`, issueData),
  deleteIssue: (issueId) => api.delete(`/issues/${issueId}`),
  assignIssue: (issueId, assignData) => api.post(`/issues/assign/${issueId}`, assignData),

  // For Employees
  getAssignedIssues: () => api.get('/team/assignedissues'),
  solveIssue: (issueData) => api.post('/solveissue', issueData),
};

// Chat API calls
export const chatAPI = {
  createRoom: (roomData) => api.post('/room', roomData),
  deleteRoom: (roomId) => api.delete(`/room/${roomId}`),
  sendMessage: (message) => api.post('/chat', message),
  getChatRoom: () => api.get('/chat'),
};

// Team API calls
export const teamAPI = {
  getTeamDashboard: () => api.get('/team'),
};

export default api;
