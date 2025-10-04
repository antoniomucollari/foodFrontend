import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireDelivery = false,
  restrictAdmin = false,
  requireAuth = false,
}) => {
  const { isAuthenticated, isAdmin, isDelivery, loading } = useAuth();
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
  // This applies to ALL routes except admin, delivery, login, and register
  if (
    isAuthenticated() &&
    isAdmin() &&
    !location.pathname.startsWith("/admin") &&
    !location.pathname.startsWith("/delivery") &&
    !location.pathname.startsWith("/login") &&
    !location.pathname.startsWith("/register")
  ) {
    return <Navigate to="/admin" replace />;
  }

  // If user is authenticated and delivery, and trying to access non-delivery routes, redirect to delivery dashboard
  // This applies to ALL routes except delivery-panel, login, and register
  if (
    isAuthenticated() &&
    isDelivery() &&
    !location.pathname.startsWith("/delivery-panel") &&
    !location.pathname.startsWith("/login") &&
    !location.pathname.startsWith("/register")
  ) {
    return <Navigate to="/delivery-panel" replace />;
  }

  // If route requires admin and user is not admin, redirect to home
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // If route requires delivery and user is not delivery, redirect to home
  if (requireDelivery && !isDelivery()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
