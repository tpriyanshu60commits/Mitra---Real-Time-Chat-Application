import { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGoogleAuth } from "../config/GoogleAuth";
import { FcGoogle } from "react-icons/fc";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiArrowRight,
  HiShieldCheck,
  HiChatAlt2,
  HiPhotograph,
  HiUsers,
} from "react-icons/hi";
import { motion } from "motion/react";
import registerCyberDesk from "../assets/register-cyber-desk.jpg";

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();
  const { isLoading: isGoogleLoading, error: googleError, isInitialized, signInWithGoogle } = useGoogleAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationError[name]) {
      setValidationError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClearForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    });
    setValidationError({});
  };

  const validate = () => {
    let Error = {};
    if (formData.fullName.length < 3) {
      Error.fullName = "Name should be more than 3 characters";
    } else if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
      Error.fullName = "Only alphabets and spaces allowed";
    }
    if (
      !/^[\w.]+@(gmail|outlook|yahoo|ricr)\.(com|in|co\.in)$/.test(
        formData.email,
      )
    ) {
      Error.email = "Use proper email format (gmail, outlook, yahoo, ricr)";
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      Error.mobileNumber = "Only valid 10-digit Indian mobile numbers allowed";
    }
    if (formData.password.length < 6) {
      Error.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      Error.confirmPassword = "Passwords do not match";
    }
    setValidationError(Error);
    return Object.keys(Error).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!agreeTerms) {
      setIsLoading(false);
      toast.error("Please agree to the Terms & Conditions");
      return;
    }

    if (!validate()) {
      setIsLoading(false);
      toast.error("Fill the form correctly");
      return;
    }
    try {
      const res = await api.post("/auth/register", formData);
      toast.success(res.data.message);
      handleClearForm();
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (userData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/googleLogin", userData);
      toast.success(res.data.message);
      sessionStorage.setItem("AppUser", JSON.stringify(res.data.data));
      setUser(res.data.data);
      setIsLogin(true);
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Google registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google auth failed:", error);
    toast.error("Google authentication failed.");
  };

  const handleGoogleLogin = () => {
    signInWithGoogle(handleGoogleSuccess, handleGoogleFailure);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full bg-[#030617] text-white flex items-center justify-center overflow-hidden px-4 sm:px-8 py-8 sm:py-12 select-none">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-cyan-500/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-fuchsia-600/15 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff0d_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Main Responsive Layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center justify-center">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Feature Highlights & Workspace Visual                        */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex lg:col-span-6 xl:col-span-6 flex-col items-start justify-center relative pr-4"
        >
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-tight text-left">
            Real{" "}
            <span
              className="text-cyan-300 font-black"
              style={{
                textShadow:
                  "0 0 15px rgba(0, 240, 255, 0.9), 0 0 35px rgba(0, 240, 255, 0.5)",
              }}
            >
              People.
            </span>
            <br />
            Real{" "}
            <span
              className="font-black bg-gradient-to-r from-[#ff1a7d] via-[#ff5b79] to-[#ff9838] bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 0 25px rgba(255, 26, 125, 0.8))",
              }}
            >
              Conversations.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-cyan-100/80 text-base sm:text-lg mt-4 text-left max-w-lg leading-relaxed">
            Sign up and start chatting with your friends, family and team.
          </p>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full">
            {/* Feature 1 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-300 text-lg shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                <HiShieldCheck />
              </div>
              <span className="text-sm font-semibold text-white tracking-wide">
                Secure Authentication
              </span>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-300 text-lg shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                <HiChatAlt2 />
              </div>
              <span className="text-sm font-semibold text-white tracking-wide">
                Instant Messaging
              </span>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-300 text-lg shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                <HiPhotograph />
              </div>
              <span className="text-sm font-semibold text-white tracking-wide">
                Media Sharing
              </span>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-300 text-lg shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                <HiUsers />
              </div>
              <span className="text-sm font-semibold text-white tracking-wide">
                One-to-One Chat
              </span>
            </div>
          </div>

          {/* Atmospheric Workspace Visual Card */}
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.2)] border border-cyan-400/30 mt-8 group">
            <img
              src={registerCyberDesk}
              alt="Mitra Workspace Lifestyle"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030617] via-[#030617]/30 to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />

            {/* Bottom branding overlay on the visual */}
            <div className="absolute bottom-4 left-6 flex items-center gap-2">
              <img
                src="/mitra-logo.svg"
                alt="Mitra Logo"
                className="w-6 h-6 object-contain"
              />
              <span className="text-lg font-black tracking-wider text-cyan-300 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                Mitra
              </span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Futuristic Glassmorphic Register Card                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full lg:col-span-6 xl:col-span-6 flex justify-center"
        >
          {/* Radiant Neon Gradient Border Frame */}
          <div
            className="w-full max-w-[500px] p-[2px] rounded-[30px] transition-all duration-500"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 240, 255, 0.9) 0%, rgba(99, 102, 241, 0.4) 45%, rgba(255, 26, 125, 0.9) 100%)",
              boxShadow:
                "0 0 45px rgba(0, 240, 255, 0.25), 0 0 70px rgba(255, 26, 125, 0.2), inset 0 0 15px rgba(0, 240, 255, 0.15)",
            }}
          >
            {/* Inner Translucent Frosted Glass Card */}
            <div className="w-full h-full bg-[#070b24]/90 backdrop-blur-2xl rounded-[28px] p-6 sm:p-8 flex flex-col relative overflow-hidden">
              {/* Top Accent Highlight */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

              {/* Branding and Card Header */}
              <div className="mb-5 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(0,240,255,0.7)]">
                    💬
                  </div>
                  <span
                    className="text-xl font-black tracking-tight text-cyan-300"
                    style={{
                      textShadow: "0 0 12px rgba(0, 240, 255, 0.8)",
                    }}
                  >
                    Mitra
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Register
                </h2>
                <p className="text-xs sm:text-sm font-medium mt-1 text-slate-300">
                  Let's get you started. Fill in your details below.
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name Input */}
                <div className="space-y-1 text-left">
                  <div className={`relative flex items-center bg-[#090f2e]/90 rounded-xl border ${validationError.fullName ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)]"} transition-all`}>
                    <HiUser className="text-cyan-400 text-lg ml-3.5 shrink-0 opacity-80" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isLoading}
                      autoComplete="name"
                      required
                      className="w-full bg-transparent py-2.5 px-3 text-white placeholder-cyan-200/35 text-sm focus:outline-none"
                    />
                  </div>
                  {validationError.fullName && (
                    <p className="text-rose-400 text-xs pl-1">
                      {validationError.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address Input */}
                <div className="space-y-1 text-left">
                  <div className={`relative flex items-center bg-[#090f2e]/90 rounded-xl border ${validationError.email ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)]"} transition-all`}>
                    <HiMail className="text-cyan-400 text-lg ml-3.5 shrink-0 opacity-80" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      autoComplete="email"
                      required
                      className="w-full bg-transparent py-2.5 px-3 text-white placeholder-cyan-200/35 text-sm focus:outline-none"
                    />
                  </div>
                  {validationError.email && (
                    <p className="text-rose-400 text-xs pl-1">
                      {validationError.email}
                    </p>
                  )}
                </div>

                {/* Mobile Number Input */}
                <div className="space-y-1 text-left">
                  <div className={`relative flex items-center bg-[#090f2e]/90 rounded-xl border ${validationError.mobileNumber ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)]"} transition-all`}>
                    <HiPhone className="text-cyan-400 text-lg ml-3.5 shrink-0 opacity-80" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      placeholder="Mobile Number (10 digits)"
                      maxLength="10"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      disabled={isLoading}
                      autoComplete="tel"
                      required
                      className="w-full bg-transparent py-2.5 px-3 text-white placeholder-cyan-200/35 text-sm focus:outline-none"
                    />
                  </div>
                  {validationError.mobileNumber && (
                    <p className="text-rose-400 text-xs pl-1">
                      {validationError.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1 text-left">
                  <div className={`relative flex items-center bg-[#090f2e]/90 rounded-xl border ${validationError.password ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)]"} transition-all`}>
                    <HiLockClosed className="text-cyan-400 text-lg ml-3.5 shrink-0 opacity-80" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                      className="w-full bg-transparent py-2.5 px-3 text-white placeholder-cyan-200/35 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="mr-3 text-cyan-300/60 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <HiEyeOff className="text-lg" />
                      ) : (
                        <HiEye className="text-lg" />
                      )}
                    </button>
                  </div>
                  {validationError.password && (
                    <p className="text-rose-400 text-xs pl-1">
                      {validationError.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1 text-left">
                  <div className={`relative flex items-center bg-[#090f2e]/90 rounded-xl border ${validationError.confirmPassword ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)]"} transition-all`}>
                    <HiLockClosed className="text-cyan-400 text-lg ml-3.5 shrink-0 opacity-80" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                      className="w-full bg-transparent py-2.5 px-3 text-white placeholder-cyan-200/35 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="mr-3 text-cyan-300/60 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <HiEyeOff className="text-lg" />
                      ) : (
                        <HiEye className="text-lg" />
                      )}
                    </button>
                  </div>
                  {validationError.confirmPassword && (
                    <p className="text-rose-400 text-xs pl-1">
                      {validationError.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="flex items-start gap-2.5 text-left text-xs pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-cyan-500/40 bg-[#090f2e] text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-400 shrink-0"
                  />
                  <span className="text-cyan-100/75 leading-tight select-none">
                    I agree to the{" "}
                    <Link
                      to="/contact"
                      className="text-cyan-400 font-medium hover:underline hover:text-cyan-300"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/contact"
                      className="text-cyan-400 font-medium hover:underline hover:text-cyan-300"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full py-3.5 px-6 rounded-full font-bold text-white text-base tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-2 shadow-xl overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(90deg, #ff007f 0%, #7928ca 50%, #0070f3 80%, #00f0ff 100%)",
                    boxShadow:
                      "0 0 25px rgba(255, 0, 127, 0.65), 0 0 35px rgba(0, 240, 255, 0.35)",
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isLoading ? (
                    <span className="relative z-10 flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                      Sign Up <HiArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              {/* Divider OR */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-cyan-500/20" />
                <span className="absolute px-3 bg-[#070b24] text-[11px] text-cyan-200/50 font-semibold tracking-widest uppercase">
                  OR
                </span>
              </div>

              {/* Continue with Google */}
              {googleError ? (
                <button
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-500/40 flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
                  disabled
                >
                  <FcGoogle className="text-lg" />
                  {googleError}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={!isInitialized || isGoogleLoading || isLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-3 bg-[#090f2e]/80 border border-cyan-500/35 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FcGoogle className="text-xl shrink-0" />
                  <span>
                    {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                  </span>
                </button>
              )}

              {/* Bottom Already Have Account */}
              <p className="text-center text-xs text-cyan-100/60 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline ml-1"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
