// NavBar.tsx
import React from 'react';
import './NavBar.css'
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const NavBar: React.FC = () => {
    const { isAuthenticated, name } = useAuth()
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/" id="home">Home</Link>
                </li>
                <li>
                    <Link to="/about" id="about">About</Link>
                </li>
                <li>
                    {isAuthenticated ? (<><span id="name-holder">Hello {name}</span> <Link to="/logout" id="logout">Logout</Link></>) : (<Link to="/login" id="login">Login</Link>)}
                </li>
                <li>
                    <Link to="/dashboard" id="dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/form" id="form">Form</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
