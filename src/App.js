import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProductDetailView from "./pages/ProductDetailView";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/product/:catIndex/:prodIndex" element={<ProductDetailView />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
      </Routes>
    </Router>
  );
}

export default App;