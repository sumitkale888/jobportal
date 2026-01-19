import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    // 1. Not Logged In? -> Go to Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Logged In but Wrong Role? -> Go Home (or Unauthorized page)
    // We check if the user's role is included in the allowedRoles array
    const userRole = user.role?.authority || user.role; // Handle Spring Security structure
    
    // Simple check: strict string match or array inclusion
    // If your backend sends role as "STUDENT", and allowedRoles is ["STUDENT"], this works.
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />; // Or a "403 Unauthorized" page
    }

    // 3. Authorized? -> Render the Page
    return <Outlet />;
};

export default ProtectedRoute;