import { useState } from 'react'
import './App.css'

import { BrowserRouter as Router, Route } from 'react-router-dom';
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
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
        <AuthProvider>
          <Router>
            <NavBar />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          </Router>
        </AuthProvider>
      </div >
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <ToastContainer />
    </>
  )
}

export default App
