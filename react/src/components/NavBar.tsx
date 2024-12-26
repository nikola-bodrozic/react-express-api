// NavBar.tsx
import React from 'react';
import './NavBar.css'
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NavBar: React.FC = () => {
    const { isAuthenticated } = useAuth()
    console.log("NavBar")
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    {isAuthenticated ? (<Link to="/logout">Logout</Link>) : (<Link to="/login">Login</Link>)}
                </li>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
