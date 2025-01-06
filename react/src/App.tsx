import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/Login/Login";
import Home from "./components/Home";
import NavBar from "./components/NavBar/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import { AuthProvider } from "./AuthContext";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Logout from "./components/Logout";
import About from './components/About';
import { useEffect, useState } from 'react';
import { axiosClient } from './axiosClient';
import { AxiosResponse } from 'axios';

function App() {
  const [hostInfo, setHostInfo] = useState("")

  useEffect(() => {
    const getData = async () => {
      try {
        const res: AxiosResponse = await axiosClient.get("/pod");
        console.log(res.data.pod)
        setHostInfo(res.data)
      } catch (error: unknown) {
        console.log(error);
      }
    };
    getData();
  }, []);
  return (
    <>
      <div className="App">
        <p>{JSON.stringify(hostInfo)}</p>
        <AuthProvider>
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            </Routes>
          </Router>
        </AuthProvider>
      </div>
      <ToastContainer />
    </>
  )
}

export default App
