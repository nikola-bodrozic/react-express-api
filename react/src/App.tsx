import { useState } from "react";
import "./App.css";
import { axiosClient } from "./axiosClient";

function App() {
  const [status, setStatus] = useState<any>();
  const [message, setMessage] = useState('');

  const login = async () => {
    try {
      const res = await axiosClient.post("/login", { "username": "mike" });
      const loginMessage = res.data;

      setStatus(loginMessage);
    } catch (error) {
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
        <button onClick={login}>login</button> <hr />
        {JSON.stringify(status)} <button onClick={getProtectedData}>Get Protected Data</button>
        {message && <p>{message}</p>}<hr />
        <button onClick={logout}>logout</button>
      </div>
    </div>
  );
}

export default App;
