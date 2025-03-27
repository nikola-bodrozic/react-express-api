import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import 'primereact/resources/themes/lara-light-indigo/theme.css'; //theme
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex
import "./App.css";

import Login from "./components/Login/Login";
import Home from "./components/Home";
import NavBar from "./components/NavBar/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard/Dashboard";
import { AuthProvider } from "./AuthContext";
import Logout from "./components/Logout";
import About from "./components/About";
import FormValidator from "./components/FormValidator/FormValidator";
import CitySearch from "./components/CitySearch/CitySearch";
import SliderToggle from "./components/SliderToggle/SliderToggle";

function App() {
  return (
    <div className="App">
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
            <Route path="/form" element={<FormValidator />} />
            <Route path="/debounce" element={<CitySearch />} />
            <Route path="/slider" element={<SliderToggle />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
