import React, { useEffect, useRef, useState } from "react";
import "./Login.css";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";
import Loader from "react-js-loader";

interface errorMsg {
  type?: string;
  value?: string;
  msg?: string;
}

const Login = () => {
  const { login, logout, renderName } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    setIsLoading(true);
    try {
      const res = await axios.post(
        "/login",
        {
          username,
          password,
        },
        {
          signal
        }
      );
      renderName(res.data.user.name);
      login();
      toast.success("Logged in successfully!");
      setIsLoading(false);
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setIsLoading(false);
      const tmpErr: string[] = [];
      error.response.data.errors.map((el: errorMsg) =>
        tmpErr.push(el.msg as string)
      );
      setErrorMessage(tmpErr);
      logout();
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log('Request aborted on component unmount');
      }
    };
  }, []);

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
