import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Temporary bypass: disable login access for now per user instruction
const AUTH_ENABLED = false;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!AUTH_ENABLED) {
    return <>{children}</>;
  }

  const token = localStorage.getItem('tendertracker_token');

  // If token is missing, redirect to corporate login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists, allow rendering
  return <>{children}</>;
};

