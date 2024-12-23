// NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css' 
const NavBar: React.FC = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                
                <li>
                    <Link to="/login">Login</Link>
                </li>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
