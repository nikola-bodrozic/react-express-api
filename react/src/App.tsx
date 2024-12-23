import React from "react";
import "./App.css";
// import Form from "./Components/Form";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./Components/Login";
import Home from "./Components/Home";
import NavBar from "./Components/NavBar";
import ProtectedRoute from "./Components/ProtectedRoute";
import Dashboard from "./Components/Dashboard";
import { AuthProvider } from "./AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logout from "./Components/Logout";

function App() {
  return (
    <div className="App">
      {/* <div className="App-border">
        <Form />
      </div> */}
      <div className="App-border">
        <AuthProvider>
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            </Routes>
          </Router>
        </AuthProvider>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
