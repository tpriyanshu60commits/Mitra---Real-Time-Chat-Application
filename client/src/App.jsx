import { Routes, Route } from "react-router-dom";
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
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#070d2b",
            color: "#f1f5f9",
            border: "1px solid rgba(6, 182, 212, 0.4)",
            boxShadow: "0 0 25px rgba(0, 240, 255, 0.2)",
            borderRadius: "14px",
            fontSize: "13px",
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#070d2b",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#070d2b",
            },
          },
        }}
      />
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
