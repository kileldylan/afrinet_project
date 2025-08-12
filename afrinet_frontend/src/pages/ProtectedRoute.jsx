import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/reset-password/:token'
];

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Allow access to public routes regardless of auth status
  if (publicRoutes.some(route => {
    const routePattern = new RegExp('^' + route.replace(/:\w+/g, '\\w+') + '$');
    return routePattern.test(location.pathname);
  })) {
    return children;
  }

  // Redirect to login if not authenticated for protected routes
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;