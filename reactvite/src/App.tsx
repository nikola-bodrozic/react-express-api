import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/Login";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import { AuthProvider } from "./AuthContext";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Logout from "./components/Logout";

function App() {

  return (
    <>
      <div className="App">
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
      </div >
      <ToastContainer />
    </>
  )
}

export default App
