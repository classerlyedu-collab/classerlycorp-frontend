import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UseStateContext } from '../context/ContextProvider';
import { RouteName } from '../routes/RouteNames';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'Supervisor' | 'Employee' | 'HR-Admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { user, role } = UseStateContext();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Small delay to ensure context is properly initialized
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const isAuthenticated = user && token;

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to={RouteName.AUTH_SCREEN} state={{ from: location }} replace />;
    }

    // If role is required and doesn't match, redirect to appropriate dashboard
    if (requiredRole && role !== requiredRole) {
        switch (role) {
            case 'Supervisor':
                return <Navigate to={RouteName.DASHBOARD_SCREEN} replace />;
            case 'Employee':
                return <Navigate to={RouteName.DASHBOARD_SCREEN_EMPLOYEE} replace />;
            case 'HR-Admin':
                return <Navigate to={RouteName.DASHBOARD_SCREEN_HR_ADMIN} replace />;
            default:
                // If role is invalid or null, redirect to login
                return <Navigate to={RouteName.AUTH_SCREEN} replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
