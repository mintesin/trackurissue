/**
 * @fileoverview Authentication Context Provider
 * 
 * This module provides global authentication state management using React Context.
 * It handles user authentication, token management, and persistent sessions.
 * 
 * Features:
 * - User authentication state management
 * - Token persistence in localStorage
 * - Automatic token validation on app startup
 * - Role-based authentication
 * - Company and user data management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

/** Context for storing authentication state */
const AuthContext = createContext(null);

/**
 * Loading spinner component shown during authentication checks
 * @component
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides authentication-related
 * functionality to child components.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  /** User's role (company, employee, teamLeader) */
  const [userRole, setUserRole] = useState(null);
  /** Currently authenticated user data */
  const [user, setUser] = useState(null);
  /** Company data associated with the user */
  const [company, setCompany] = useState(null);
  /** Authentication token */
  const [token, setToken] = useState(null);
  /** Authentication status */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  /** Loading state during authentication checks */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication state on component mount
   * Checks for stored credentials and validates token
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Retrieve stored authentication data
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedCompany = localStorage.getItem('company');

        if (!storedToken || !storedUser || !storedCompany) {
          throw new Error('No stored credentials');
        }

        // Configure API with stored token
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Validate token by fetching user profile
        const parsedUser = JSON.parse(storedUser);
        const userRole = parsedUser.role;
        
        // Different endpoints for company and employee validation
        if (userRole === 'company') {
          await api.get('/admin/profile');
        } else {
          await api.get(`/employee/profile/${parsedUser._id}`);
        }

        // If validation succeeds, restore authentication state
        setToken(storedToken);
        setUser(parsedUser);
        setCompany(JSON.parse(storedCompany));
        setUserRole(userRole);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear authentication state on validation failure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        delete api.defaults.headers.common['Authorization'];
        
        setToken(null);
        setUser(null);
        setCompany(null);
        setUserRole(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Log in a user and set up authentication state
   * @param {Object} userData - User information
   * @param {Object} companyData - Company information
   * @param {string} authToken - Authentication token
   */
  const login = (userData, companyData, authToken) => {
    // Store authentication data
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('company', JSON.stringify(companyData));
    
    // Configure API with new token
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // Update authentication state
    setToken(authToken);
    setUser(userData);
    setCompany(companyData);
    setUserRole(userData.role);
    setIsAuthenticated(true);
  };

  /**
   * Log out the current user and clear authentication state
   */
  const logout = () => {
    // Clear stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    // Remove token from API configuration
    delete api.defaults.headers.common['Authorization'];
    
    // Reset authentication state
    setToken(null);
    setUser(null);
    setCompany(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  // Show loading spinner during initialization
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Context value containing authentication state and methods
  const value = {
    userRole,      // Current user's role
    user,          // User data
    company,       // Company data
    token,         // Authentication token
    isAuthenticated, // Authentication status
    login,         // Login method
    logout         // Logout method
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
