import React from "react";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ByeBye from "./pages/byebye";
import FocusPage from "./pages/FocusPage";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/reg" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home/*" element={<DashboardPage />} />
        <Route path="/byebye" element={<ByeBye />} />
        <Route path="/focus" element={<FocusPage />} />
      </Routes>
    </Router>
  );
}
export default App;
