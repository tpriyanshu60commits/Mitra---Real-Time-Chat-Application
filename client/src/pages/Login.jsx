import { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGoogleAuth } from "../config/GoogleAuth";
import { FcGoogle } from "react-icons/fc";
import {
  HiUser,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiArrowRight,
  HiChevronRight,
} from "react-icons/hi";
import { motion } from "motion/react";
import loginCyberPhone from "../assets/login-cyber-phone.jpg";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();
  const { isLoading, error, isInitialized, signInWithGoogle } = useGoogleAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({ email: "", password: "" });
  };

  const handleGoogleSuccess = async (userData) => {
    console.log("Google Login Data", userData);
    setLoading(true);
    try {
      const res = await api.post("/auth/googleLogin", userData);
      toast.success(res.data.message);
      sessionStorage.setItem("AppUser", JSON.stringify(res.data.data));
      setUser(res.data.data);
      setIsLogin(true);
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google login failed:", error);
    toast.error("Google login failed. Please try again.");
  };

  const handleGoogleLogin = () => {
    signInWithGoogle(handleGoogleSuccess, handleGoogleFailure);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      toast.success(res.data.message);
      sessionStorage.setItem("AppUser", JSON.stringify(res.data.data));
      setUser(res.data.data);
      setIsLogin(true);
      handleClearForm();
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full bg-[#030617] text-white flex items-center justify-center overflow-hidden px-4 sm:px-8 py-8 sm:py-12 select-none">
      {/* Background Cyber Ambient Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Neon Glow Blobs */}
        <div className="absolute top-10 left-10 w-[550px] h-[550px] bg-cyan-500/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-fuchsia-600/15 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 blur-[160px] rounded-full" />

        {/* Subtle Cyber Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff0d_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Main Responsive Grid Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center justify-center">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Visual Showcase with 3D Phone & Neon Glow Script           */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col items-center justify-center relative"
        >
          {/* Top-Left Corner Branding Badge */}
          <div className="w-full flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.75)]">
              <img
                src="/mitra-logo.svg"
                alt="Mitra Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-3xl font-black tracking-tight text-cyan-300"
              style={{
                textShadow:
                  "0 0 15px rgba(0, 240, 255, 0.95), 0 0 30px rgba(0, 240, 255, 0.6)",
              }}
            >
              Mitra
            </span>
          </div>

          {/* 3D Cyber Phone Mockup Container */}
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.25)] border border-cyan-400/30 group">
            <img
              src={loginCyberPhone}
              alt="Mitra Real-Time Cyber Chat"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
            {/* Soft Edge Blending Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030617] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030617]/40 via-transparent to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />

            {/* Glowing Neon Handwritten Badge on the bottom-left */}
            <div className="absolute bottom-5 left-6 z-20 flex flex-col items-start">
              <span
                className="text-2xl font-black italic tracking-wide text-cyan-300 drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]"
                style={{
                  fontFamily: "cursive, sans-serif",
                  textShadow:
                    "0 0 15px rgba(0, 240, 255, 0.9), 0 0 30px rgba(0, 240, 255, 0.5)",
                }}
              >
                Good Chats
              </span>
              <span
                className="text-2xl font-black italic tracking-wide text-cyan-200 -mt-1 drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]"
                style={{
                  fontFamily: "cursive, sans-serif",
                  textShadow:
                    "0 0 15px rgba(0, 240, 255, 0.9), 0 0 30px rgba(0, 240, 255, 0.5)",
                }}
              >
                Better Vibes
              </span>
              {/* Neon Glow Streak Underline */}
              <div className="w-28 h-1 mt-1 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-transparent shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Futuristic Glassmorphic Neon Login Card                    */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full lg:col-span-6 xl:col-span-5 flex justify-center"
        >
          {/* Multi-Color Glowing Gradient Border Frame */}
          <div
            className="w-full max-w-[460px] p-[2px] rounded-[30px] transition-all duration-500"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 240, 255, 0.9) 0%, rgba(99, 102, 241, 0.4) 45%, rgba(255, 26, 125, 0.9) 100%)",
              boxShadow:
                "0 0 45px rgba(0, 240, 255, 0.25), 0 0 70px rgba(255, 26, 125, 0.2), inset 0 0 15px rgba(0, 240, 255, 0.15)",
            }}
          >
            {/* Inner Translucent Frosted Glass Card */}
            <div className="w-full h-full bg-[#070b24]/90 backdrop-blur-2xl rounded-[28px] p-7 sm:p-9 flex flex-col relative overflow-hidden">
              {/* Top Atmospheric Highlight */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

              {/* Header Title */}
              <div className="mb-6 text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome to Mitra
                </h2>
                <p className="text-sm font-medium mt-1 text-slate-300">
                  Your conversations.{" "}
                  <span
                    className="text-cyan-400 font-semibold"
                    style={{
                      textShadow: "0 0 10px rgba(0, 240, 255, 0.8)",
                    }}
                  >
                    Your space.
                  </span>
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email or Phone Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-cyan-200/90 flex items-center gap-1">
                    <span className="text-amber-400 font-bold">*</span> Email or Phone
                  </label>
                  <div className="relative flex items-center bg-[#090f2e]/90 rounded-xl border border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)] transition-all">
                    <HiUser className="text-cyan-400 text-lg ml-3.5 shrink-0 opacity-80" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="username"
                      required
                      className="w-full bg-transparent py-3 px-3 text-white placeholder-cyan-200/30 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-cyan-200/90 flex items-center gap-1">
                    <span className="text-amber-400 font-bold">*</span> Password
                  </label>
                  <div className="relative flex items-center bg-[#090f2e]/90 rounded-xl border border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)] transition-all">
                    <HiLockClosed className="text-cyan-400 text-lg ml-3.5 shrink-0 opacity-80" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="current-password"
                      required
                      className="w-full bg-transparent py-3 px-3 text-white placeholder-cyan-200/30 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="mr-3.5 text-cyan-300/60 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <HiEyeOff className="text-lg" />
                      ) : (
                        <HiEye className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-cyan-100/75 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-cyan-500/40 bg-[#090f2e] text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-400"
                    />
                    <span>Remember me</span>
                  </label>

                  <Link
                    to="/contact"
                    className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Gradient Action Button (Login ->) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-3.5 px-6 rounded-full font-bold text-white text-base tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-3 shadow-xl overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(90deg, #ff007f 0%, #7928ca 50%, #0070f3 80%, #00f0ff 100%)",
                    boxShadow:
                      "0 0 25px rgba(255, 0, 127, 0.65), 0 0 35px rgba(0, 240, 255, 0.35)",
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {loading ? (
                    <span className="relative z-10 flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-between w-full px-2">
                      <span />
                      <span className="flex items-center gap-1.5 font-bold">
                        Login <HiArrowRight className="text-base" />
                      </span>
                      <HiChevronRight className="text-lg opacity-80 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              {/* Divider OR */}
              <div className="relative flex items-center justify-center my-4.5">
                <div className="w-full border-t border-cyan-500/20" />
                <span className="absolute px-3 bg-[#070b24] text-[11px] text-cyan-200/50 font-semibold tracking-widest uppercase">
                  OR
                </span>
              </div>

              {/* Continue with Google Button */}
              {error ? (
                <button
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-500/40 flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
                  disabled
                >
                  <FcGoogle className="text-lg" />
                  {error}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={!isInitialized || isLoading || loading}
                  className="w-full py-3 px-4 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-3 bg-[#090f2e]/80 border border-cyan-500/35 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FcGoogle className="text-xl shrink-0" />
                  <span>
                    {isLoading ? "Signing in..." : "Continue with Google"}
                  </span>
                </button>
              )}

              {/* Bottom Registration Link */}
              <p className="text-center text-xs text-cyan-100/60 mt-5">
                New to Mitra?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
