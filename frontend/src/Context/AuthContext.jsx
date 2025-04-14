import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // For demo, hardcode role; in real app, fetch from backend on login
  const [userRole, setUserRole] = useState('employee'); // 'admin', 'teamleader', 'employee'

  const loginAs = (role) => {
    setUserRole(role);
  };

  return (
    <AuthContext.Provider value={{ userRole, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
