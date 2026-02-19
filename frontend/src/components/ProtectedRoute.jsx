import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to /');
    return <Navigate to="/" replace />;
  }

  if (requiredRole) {
    const userRole = getUserRole();
    if (userRole !== requiredRole) {
      console.log(`Role mismatch. Required: ${requiredRole}, Got: ${userRole}. Redirecting to /`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
