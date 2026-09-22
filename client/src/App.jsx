import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import SiteHeader from "./components/SiteHeader";
import { Toaster } from "react-hot-toast";
import Contactus from "./pages/Contactus";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import Chat from "./pages/Chat";
function App() {
  return (
    <>
      <Toaster />
      <SiteHeader />
      <Routes>
        <Route path="/contact" element={<Contactus />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;
