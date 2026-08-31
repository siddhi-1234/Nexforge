import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function MainRoutes() {
  const navigate = useNavigate();
  const [isWiping, setIsWiping] = useState(false);

  const handleLoginSuccess = () => {
    setIsWiping(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
    setTimeout(() => {
      setIsWiping(false);
    }, 1100);
  };

  return (
    <>
      <div className={`nf-wipe-overlay ${isWiping ? "active" : ""}`} />
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
}

export default App;
