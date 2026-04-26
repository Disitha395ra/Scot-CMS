// src/components/layout/ProtectedRoute.jsx
// Guards routes: redirects unauthenticated users and enforces admin-only routes.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import Spinner from '../common/Spinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
