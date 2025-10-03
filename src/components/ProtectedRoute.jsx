import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  restrictAdmin = false,
  requireAuth = false,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated and admin, and trying to access non-admin routes, redirect to admin dashboard
  // This applies to ALL routes except admin, login, and register
  if (isAuthenticated() && isAdmin() && !location.pathname.startsWith("/admin") && !location.pathname.startsWith("/login") && !location.pathname.startsWith("/register")) {
    return <Navigate to="/admin" replace />;
  }

  // If route requires admin and user is not admin, redirect to home
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
