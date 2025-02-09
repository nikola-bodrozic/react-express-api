import React, { useState } from "react";
import "./Login.css";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";
import Loader from "react-js-loader";

const Login = () => {
  const { login, renderName } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("password123");
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        "/login",
        {
          username,
          password
        }
      );
      // console.log(res.data)
      renderName(res.data.username);
      localStorage.setItem('jwtToken', res.data.token);
      // console.log(res.data.token, res.data.username)
      // return
      login();
      toast.success("Logged in successfully!");
      setIsLoading(false);
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      setIsLoading(false);
      console.log(error);

      if (axios.isAxiosError(error)) {
        // Handle Axios error
        setErrorMessage([error.message]);
      } else {
        // Handle unexpected error
        setErrorMessage(['An unexpected error occurred']);
      }
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
