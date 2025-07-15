import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import NotAuthorizedPage from '../pages/NotAuthorized';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = allowedRoles.some(role => user.userData.roles?.includes(role));
  
  if (!hasRequiredRole) {
    return <NotAuthorizedPage />;
  }

  return <Outlet />;
};

export default ProtectedRoute;