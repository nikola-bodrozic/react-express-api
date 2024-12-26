// Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from "../axiosClient";
import { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res: AxiosResponse = await axiosClient.post("/login", { username, password });
            login()
            console.log(res.status, res.statusText)
            toast.success('Logged in successfully!');
            navigate('/dashboard')
        } catch (error: any) {
            console.log(error)
            toast.error('Invalid username or password');
            logout()
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        data-testid="username"
                        value={username}
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        data-testid="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" name="login">Login</button>
            </form>
        </div>
    );
};

export default Login;
