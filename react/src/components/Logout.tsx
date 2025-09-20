import { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from "../axiosConfig";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await axios.post("/logout", {});
        logout();
        navigate('/');
      } catch (error) {
        console.error('Logout failed:', error);
        toast.error('Failed to log out');
      }
    };

    performLogout();
  }, [logout, navigate]);

  return null;
};

export default Logout;
