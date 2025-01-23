// import "primereact/resources/themes/lara-light-cyan/theme.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import Login from "./components/Login/Login";
import Home from "./components/Home";
import NavBar from "./components/NavBar/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard/Dashboard";
import { AuthProvider } from "./AuthContext";
import Logout from "./components/Logout";
import About from "./components/About";

import { Button } from 'primereact/button';

import 'primereact/resources/themes/lara-light-indigo/theme.css'; //theme
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex
import "./App.css";
function App() {
  return (
    <PrimeReactProvider>
    <div>
      <Button label="Success" severity="success" />
      <AuthProvider>
        <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<Dashboard />} />}
              />
            </Routes>
        </Router>
      </AuthProvider>
    </div>
          </PrimeReactProvider>
  );
}

export default App;
