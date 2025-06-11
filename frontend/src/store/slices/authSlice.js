/**
 * @fileoverview Authentication Redux Slice
 * 
 * This module defines the Redux slice for authentication state management.
 * It handles user authentication, authorization, and session management using Redux Toolkit.
 * 
 * Features:
 * - User authentication state management
 * - Role-based access control
 * - Token persistence and management
 * - Loading and error state handling
 * - Automatic localStorage synchronization
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial authentication state
 * Defines the default values for all authentication-related state
 */
const initialState = {
  /** Current authenticated user data */
  user: null,
  /** Authentication token from localStorage */
  token: localStorage.getItem('token'),
  /** Authentication status */
  isAuthenticated: false,
  /** Loading state for async operations */
  isLoading: false,
  /** Error message for failed operations */
  error: null,
  /** User role: 'company', 'teamLeader', or 'employee' */
  role: null,
};

/**
 * Authentication slice definition
 * Contains all reducers for authentication state management
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Start login process
     * Sets loading state and clears any previous errors
     */
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Handle successful login
     * Updates state with user data and stores token
     * @param {Object} action.payload - Login success data
     * @param {Object} action.payload.user - User information
     * @param {string} action.payload.token - Authentication token
     * @param {string} action.payload.role - User role
     */
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      localStorage.setItem('token', action.payload.token);
    },

    /**
     * Handle login failure
     * Clears authentication state and removes stored data
     * @param {Object} action.payload - Error message
     */
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
      // Clear all auth-related items from localStorage on login failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
    },

    /**
     * Handle user logout
     * Resets all authentication state and clears stored data
     */
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
      // Clear all auth-related items from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
    },

    /**
     * Clear error state
     * Removes any error messages from the state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
});

/** Export all action creators */
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} = authSlice.actions;

/**
 * Authentication State Selectors
 * These selectors provide easy access to specific parts of the auth state
 */

/** Select entire auth state */
export const selectAuth = (state) => state.auth;

/** Select authentication status */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

/** Select current user data */
export const selectUser = (state) => state.auth.user;

/** Select user role */
export const selectRole = (state) => state.auth.role;

/** Select error message */
export const selectError = (state) => state.auth.error;

/** Select loading state */
export const selectIsLoading = (state) => state.auth.isLoading;

/**
 * Role-based Access Control Selectors
 * These selectors help with role-based UI rendering and access control
 */

/** Check if user is a company admin */
export const selectIsCompanyAdmin = (state) => state.auth.role === 'company';

/** Check if user is a team leader */
export const selectIsTeamLeader = (state) => state.auth.role === 'teamLeader';

/** Check if user is an employee */
export const selectIsEmployee = (state) => state.auth.role === 'employee';

export default authSlice.reducer;
