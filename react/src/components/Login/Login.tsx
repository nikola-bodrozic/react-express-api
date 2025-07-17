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
    setErrorMessage([]); // Clear previous errors
    
    try {
      const res = await axios.post("/login", { username, password });
      localStorage.setItem('jwtToken', res.data.token);
      renderName(res.data.username);
      login();

      navigate("/dashboard");
      
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log(error.response)
          // Backend returned an error response (4xx, 5xx)
          const message = error.response.data.error || 
                         error.response.data.message || 
                         'Invalid credentials';
          setErrorMessage([message]);
        } else if (error.request) {
          // Request was made but no response received
          setErrorMessage(['Network error - please try again']);
        } else {
          // Something happened in setting up the request
          setErrorMessage(['Login failed - please try again']);
        }
      } else {
        // Non-Axios error
        setErrorMessage(['An unexpected error occurred']);
        console.error('Non-Axios error:', error);
      }
    } finally {
      setIsLoading(false); // Ensure loading state is always reset
    }
  };

  return isLoading ? (
    <div>
      <div className="loaderHolder" id="loader">
        <Loader
          type="spinner-circle"
          bgColor={"green"}
          color={"red"}
          size={150}
        />
      </div>
    </div>
  ) : (
    <>
      <div id="error">
        {errorMessage.length > 0 &&
          errorMessage.map((el: string, index: number) => (
            <div key={index} className="err-item">
              {el}
            </div>
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
