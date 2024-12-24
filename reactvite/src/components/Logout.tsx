// Logout.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/');
    }, [logout, navigate]);

    return null;
};

export default Logout;
