import React, { useState } from "react";
import "./Login.css";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../axiosConfig";
import Loader from "react-js-loader";

const Login = () => {
  const { login, renderName } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage([]);

    try {
      const res = await axios.post("/login", { username, password });

      // Assuming backend returns { username: '...' }
      renderName(res.data.username);
      login();
      navigate("/dashboard");

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data.error || 
                          error.response.data.message || 
                          'Invalid credentials';
          setErrorMessage([message]);
        } else if (error.request) {
          setErrorMessage(['Network error - please try again']);
        } else {
          setErrorMessage(['Login failed - please try again']);
        }
      } else {
        setErrorMessage(['An unexpected error occurred']);
        console.error('Non-Axios error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <div className="loaderHolder" id="loader">
      <Loader type="spinner-circle" bgColor="green" color="red" size={150} />
    </div>
  ) : (
    <>
      <div id="error">
        {errorMessage.map((el, index) => (
          <div key={index} className="err-item">{el}</div>
        ))}
      </div>

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
        <button type="submit" className="button" name="login">
          Login
        </button>
      </form>
    </>
  );
};

export default Login;
