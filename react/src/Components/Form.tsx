import React, { useState } from "react";
import { axiosClient } from "./axiosClient";

function Form() {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/login", { username, password });
      const loginMessage = res.data.msg;
      setStatus(loginMessage);
    } catch (error: any) {
      console.log(error)
      setStatus(error.message + ": " + error.response.data.msg);
      console.error(error);
    }
  }


  const getProtectedData = async () => {
    try {
      const response = await axiosClient.get('/protected');
      setMessage(response.data.message);
    } catch (error: any) {
      // todo redirect to login
      if (error.response.status !== 200) setMessage("Log in");
      console.error('Protected route error:', error);
    }
  };

  const logout = async () => {
    try {
      const response = await axiosClient.delete('/logout');
      setStatus(response.data.msg)
    } catch (error) {
      console.log('Protected route error:');
    }
  };

  return (
    <div>
      <div>
        <h2>replace me</h2>
        <form onSubmit={login}>
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
      {status}
      <hr />
      <button onClick={getProtectedData}>Get Protected Data</button> {message} <hr />
      <button onClick={logout}>logout</button>
    </div>
  );
}

export default Form;
