// Login.tsx
import React, { useState } from 'react';
import "./Login.css"
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from "../../axiosClient";
import { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

interface errorMsg {
    type?: string;
    value?: string;
    msg?: string;
}

const Login = () => {
    const { login, logout, renderName } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string[]>([]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res: AxiosResponse = await axiosClient.post("/login", { username, password });
            renderName(res.data.user.name)
            login()
            toast.success('Logged in successfully!');
            navigate('/dashboard')
        } catch (error: any) {
            const tmpErr: string[] = [];
            error.response.data.errors.map((el: errorMsg) => tmpErr.push(el.msg as string))
            setErrorMessage(tmpErr);
            logout()
        }
    };

    return (
        <div>
            <div id="error"> {errorMessage.length > 0 && errorMessage.map((el: string, index: number) => <div key={index} style={{ color: "red" }}>{el}</div>)} </div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Username: </label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className='button' name="login">Login</button>
            </form>
        </div>
    );
};

export default Login;
