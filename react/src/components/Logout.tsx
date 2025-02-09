import { useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from "../axiosConfig";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const token = localStorage.getItem('jwtToken');

      try {
        const res = await axios.post("/logout", {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success(res.data);
        localStorage.removeItem('jwtToken');
        logout();
        navigate('/');
      } catch (error) {
        console.error('Request failed:', error);
        // Handle error response (you can use toast or any other notification here)
        toast.error('Failed to log out');
      }
    }
    getData();
  }, [logout, navigate]);

  return null
};

export default Logout;
