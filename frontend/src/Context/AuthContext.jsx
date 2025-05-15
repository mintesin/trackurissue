import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Separate loading component for better organization
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedCompany = localStorage.getItem('company');

        if (!storedToken || !storedUser || !storedCompany) {
          throw new Error('No stored credentials');
        }

        // Set the token in the API instance
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Try to fetch user profile to verify token is still valid
        const parsedUser = JSON.parse(storedUser);
        const userRole = parsedUser.role;
        
        if (userRole === 'company') {
          await api.get('/admin/profile');
        } else {
          await api.get(`/employee/profile/${parsedUser._id}`);
        }

        // If the request succeeds, token is valid
        setToken(storedToken);
        setUser(parsedUser);
        setCompany(JSON.parse(storedCompany));
        setUserRole(userRole);
        setIsAuthenticated(true);
      } catch (error) {
        // If token is invalid or there's an error, clear everything
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

  const login = (userData, companyData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('company', JSON.stringify(companyData));
    
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    setToken(authToken);
    setUser(userData);
    setCompany(companyData);
    setUserRole(userData.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    delete api.defaults.headers.common['Authorization'];
    
    setToken(null);
    setUser(null);
    setCompany(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const value = {
    userRole,
    user,
    company,
    token,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
