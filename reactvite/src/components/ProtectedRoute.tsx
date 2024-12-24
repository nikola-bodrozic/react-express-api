// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface ProtectedRouteProps {
    element: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
