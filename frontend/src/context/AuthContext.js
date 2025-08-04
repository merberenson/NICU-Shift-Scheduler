import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    console.log(userData);
    setUser({ userData });
  };

  const logout = () => {
    setUser(null);
  };

  const getUserId = () => user?.userData?._id;
  const getUsername = () => user?.userData?.username;
  const getUserRoles = () => user?.userData?.roles || [];
  const getAccessToken = () => user?.userData?.accessToken;
  const getRefreshToken = () => user?.userData?.refreshToken;

  const hasRole = (role) => getUserRoles().includes(role);

  const isAuthenticated = () => !!user?.userData;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      getUserId,
      getUsername, 
      getUserRoles,
      getAccessToken,
      getRefreshToken,
      hasRole,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access to context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};