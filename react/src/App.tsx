import { useState } from "react";
import "./App.css";
import { axiosClient } from "./axiosClient";
import { AxiosError } from "axios";

function App() {
  const [status, setStatus] = useState<any>('ini');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/login", { username, password });
      const loginMessage = res.data;
      setStatus(loginMessage);
    } catch (error: AxiosError | any) {
      // handle failed POST request based on status and message
      setStatus(error.status + " " + error.response.data.msg);
      console.error(error);
    }
  }


  const getProtectedData = async () => {
    try {
      const response = await axiosClient.get('/protected');
      setMessage(response.data.message);
    } catch (error: any) {
      // todo redirect to login
      if (error.response.status != 200) setMessage("Log in");
      console.error('Protected route error:', error);
    }
  };

  const logout = async () => {
    try {
      const response = await axiosClient.delete('/logout');
      setStatus({ msg: response.data })
    } catch (error) {
      console.log('Protected route error:');
    }
  };

  return (
    <div className="App">
      <div className="App-border">
        <div>
          <h2>Login</h2>
          <form onSubmit={login}>
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
        {JSON.stringify(status)}  <hr />
        <button onClick={getProtectedData}>Get Protected Data</button> {message} <hr />
        <button onClick={logout}>logout</button>
      </div>
    </div>
  );
}

export default App;
