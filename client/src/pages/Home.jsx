import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroCyberPhone from "../assets/hero-cyber-phone.jpg";
import aboutCyberAvatars from "../assets/about-cyber-avatars.jpg";
import aboutBg from "../assets/about-bg.jpg";
import featuresBg from "../assets/features-bg.jpg";
import {
  HiLightningBolt,
  HiShieldCheck,
  HiHeart,
  HiChatAlt2,
  HiLockClosed,
  HiUserGroup,
  HiPhotograph,
  HiUsers,
} from "react-icons/hi";

const Home = () => {
  const navigate = useNavigate();
  const { isLogin } = useAuth();

  return (
    <div className="w-full overflow-x-hidden bg-[#030412] text-white select-none">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col items-center justify-center">
        {/* Immersive High-Vibrancy Cyber Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={heroCyberPhone}
            alt="Mitra Cyber Matrix"
            className="w-full h-full object-cover object-center sm:object-bottom scale-100 sm:scale-105 opacity-95"
          />

          {/* Soft Contrast Tint (preserving vivid colors & neon glows) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050716]/60 via-transparent to-[#030412]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(5,7,22,0.25)_0%,transparent_75%)]" />

          {/* Dynamic Center Atmospheric Neon Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-gradient-to-b from-cyan-400/20 via-fuchsia-500/15 to-transparent blur-[110px] rounded-full" />
        </div>

        {/* Main Centered Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1">
              <span
                className="text-cyan-300 font-black"
                style={{
                  textShadow:
                    "0 0 20px rgba(0, 240, 255, 0.95), 0 0 45px rgba(0, 240, 255, 0.7), 0 0 90px rgba(0, 240, 255, 0.4)",
                }}
              >
                Join
              </span>
              <span
                className="font-black bg-gradient-to-r from-[#ff1a7d] via-[#ff5b79] to-[#ff9838] bg-clip-text text-transparent"
                style={{
                  filter: "drop-shadow(0 0 35px rgba(255, 26, 125, 0.85))",
                }}
              >
                Mitra Today
              </span>
            </h1>

            {/* Mini Floating Glowing Speech Bubbles */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="my-4 sm:my-5 relative flex items-center justify-center"
            >
              <div className="relative flex items-center gap-1.5 scale-110 sm:scale-125">
                {/* Pink Bubble */}
                <div className="w-8 h-8 rounded-2xl rounded-bl-none bg-gradient-to-tr from-[#ff1361] to-[#ff9000] p-[1.5px] shadow-[0_0_20px_rgba(255,19,97,0.9)]">
                  <div className="w-full h-full bg-[#1b0826]/90 backdrop-blur-md rounded-2xl rounded-bl-none flex items-center justify-center gap-1 px-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse delay-200" />
                  </div>
                </div>

                {/* Cyan Bubble */}
                <div className="w-9 h-9 rounded-2xl rounded-br-none bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] p-[1.5px] -ml-2 -mt-2 shadow-[0_0_22px_rgba(0,242,254,0.95)]">
                  <div className="w-full h-full bg-[#051c2c]/90 backdrop-blur-md rounded-2xl rounded-br-none flex items-center justify-center gap-1 px-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subtitle */}
            <p
              className="text-lg sm:text-2xl md:text-3xl font-bold tracking-wide text-[#38f2ff] max-w-2xl mx-auto"
              style={{
                textShadow:
                  "0 0 15px rgba(56, 242, 255, 0.9), 0 0 35px rgba(0, 240, 255, 0.5)",
              }}
            >
              Your conversations. Your space.
            </p>
          </motion.div>

          {/* Hero Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8 sm:mt-10"
          >
            {/* Get Started Button */}
            <button
              onClick={() => navigate(isLogin ? "/chat" : "/login")}
              className="group relative px-10 sm:px-12 py-4 sm:py-4.5 rounded-full font-black text-white text-lg sm:text-xl tracking-wider transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer shadow-2xl"
              style={{
                background:
                  "linear-gradient(90deg, #ff2e63 0%, #ff5722 50%, #ff9100 100%)",
                boxShadow:
                  "0 0 30px rgba(255, 46, 99, 0.9), 0 0 65px rgba(255, 87, 34, 0.55), inset 0 0 12px rgba(255, 255, 255, 0.5)",
                border: "2px solid rgba(255, 255, 255, 0.9)",
              }}
            >
              <span className="relative z-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                Get Started
              </span>
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Learn More Button */}
            <button
              onClick={() => {
                const aboutSec = document.getElementById("about-section");
                if (aboutSec) {
                  aboutSec.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate("/contact");
                }
              }}
              className="group relative px-10 sm:px-12 py-4 sm:py-4.5 rounded-full font-black text-cyan-200 text-lg sm:text-xl tracking-wider transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer backdrop-blur-xl"
              style={{
                background: "rgba(18, 12, 54, 0.8)",
                border: "2px solid #6c47ff",
                boxShadow:
                  "0 0 28px rgba(108, 71, 255, 0.75), inset 0 0 14px rgba(108, 71, 255, 0.4)",
              }}
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-200">
                Learn More
              </span>
              <div className="absolute inset-0 rounded-full bg-[#6c47ff]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT MITRA SECTION                                                    */}
      {/* ========================================================================= */}
      <section
        id="about-section"
        className="relative w-full py-16 sm:py-24 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-[#030412] overflow-hidden"
      >
        {/* Immersive Cyber Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={aboutBg}
            alt="Mitra About Cyber Universe"
            className="w-full h-full object-cover object-center opacity-40 sm:opacity-55"
          />
          {/* Top, Bottom & Radial Gradient Masks for smooth blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030412] via-[#030412]/50 to-[#030412]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030412_85%)]" />
        </div>

        {/* Ambient Laser Beams & Radial Glows */}
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-cyan-500/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-[600px] h-[600px] bg-fuchsia-600/15 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full mx-auto relative z-10">
          {/* Section Main Container: Left Text & Right 3D Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left space-y-4 sm:space-y-6"
            >
              {/* Title */}
              <div className="flex flex-col items-start">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight flex items-center gap-3">
                  <span
                    className="text-cyan-300"
                    style={{
                      textShadow:
                        "0 0 15px rgba(0, 240, 255, 0.9), 0 0 35px rgba(0, 240, 255, 0.5)",
                    }}
                  >
                    About
                  </span>
                  <span
                    className="bg-gradient-to-r from-[#ff1a7d] via-[#ff5b79] to-[#ff9838] bg-clip-text text-transparent"
                    style={{
                      filter: "drop-shadow(0 0 25px rgba(255, 26, 125, 0.8))",
                    }}
                  >
                    Mitra
                  </span>
                </h2>

                {/* Mini Speech Bubbles */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-5 h-5 rounded-lg rounded-bl-none bg-gradient-to-tr from-[#ff1361] to-[#ff9000] p-[1px] shadow-[0_0_10px_rgba(255,19,97,0.8)]">
                    <div className="w-full h-full bg-[#1b0826] rounded-lg rounded-bl-none flex items-center justify-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-pink-300" />
                      <span className="w-1 h-1 rounded-full bg-pink-300" />
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg rounded-br-none bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] p-[1px] -ml-1.5 -mt-1 shadow-[0_0_12px_rgba(0,242,254,0.9)]">
                    <div className="w-full h-full bg-[#051c2c] rounded-lg rounded-br-none flex items-center justify-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-200" />
                      <span className="w-1 h-1 rounded-full bg-cyan-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subheading */}
              <p
                className="text-lg sm:text-2xl font-bold text-[#38e1ff] tracking-wide"
                style={{
                  textShadow:
                    "0 0 10px rgba(56, 225, 255, 0.8), 0 0 25px rgba(0, 240, 255, 0.4)",
                }}
              >
                More than just a chat app.
              </p>

              {/* Description Paragraphs */}
              <div className="space-y-3 text-cyan-100/75 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl">
                <p>
                  <strong className="text-white font-semibold">Mitra</strong> is
                  a modern real-time communication platform designed to bring
                  people closer. Chat, share, and stay connected — all in one
                  place.
                </p>
                <p>
                  Built with the latest technologies, Mitra offers a fast, secure
                  and seamless experience for everyone.
                </p>
              </div>
            </motion.div>

            {/* Right 3D Visual Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-5 relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] rounded-3xl overflow-hidden shadow-[0_0_45px_rgba(0,240,255,0.35)] border border-cyan-400/40 group"
            >
              <img
                src={aboutCyberAvatars}
                alt="About Mitra 3D Cyber Community"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04051a]/70 via-transparent to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
            </motion.div>
          </div>

          {/* Bottom 3 Highlights Cards (Fast, Secure, Simple) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-14 sm:mt-16 w-full"
          >
            {/* Fast Card */}
            <div
              className="relative rounded-2xl p-6 flex items-center gap-4 backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                borderColor: "rgba(0, 240, 255, 0.55)",
                boxShadow:
                  "0 0 25px rgba(0, 240, 255, 0.2), inset 0 0 15px rgba(0, 240, 255, 0.08)",
              }}
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-2xl shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.6)]">
                <HiLightningBolt />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Fast
                </h3>
                <p className="text-cyan-100/70 text-xs sm:text-sm mt-0.5">
                  Real-time communication with low latency.
                </p>
              </div>
            </div>

            {/* Secure Card */}
            <div
              className="relative rounded-2xl p-6 flex items-center gap-4 backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                borderColor: "rgba(255, 42, 133, 0.55)",
                boxShadow:
                  "0 0 25px rgba(255, 42, 133, 0.2), inset 0 0 15px rgba(255, 42, 133, 0.08)",
              }}
            >
              <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 text-2xl shrink-0 shadow-[0_0_15px_rgba(255,42,133,0.6)]">
                <HiShieldCheck />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Secure
                </h3>
                <p className="text-fuchsia-100/70 text-xs sm:text-sm mt-0.5">
                  Your privacy is our priority.
                </p>
              </div>
            </div>

            {/* Simple Card */}
            <div
              className="relative rounded-2xl p-6 flex items-center gap-4 backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                borderColor: "rgba(129, 140, 248, 0.55)",
                boxShadow:
                  "0 0 25px rgba(129, 140, 248, 0.2), inset 0 0 15px rgba(129, 140, 248, 0.08)",
              }}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-300 text-2xl shrink-0 shadow-[0_0_15px_rgba(129,140,248,0.6)]">
                <HiHeart />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Simple
                </h3>
                <p className="text-indigo-100/70 text-xs sm:text-sm mt-0.5">
                  Easy to use. Built for everyone.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MITRA FEATURES SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-[#030412] overflow-hidden">
        {/* Immersive Cyber Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={featuresBg}
            alt="Mitra Features Cyber Matrix"
            className="w-full h-full object-cover object-center opacity-45 sm:opacity-60"
          />
          {/* Top, Bottom & Radial Gradient Masks for smooth blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030412] via-[#030412]/50 to-[#02030d]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030412_85%)]" />
        </div>

        {/* Dynamic Center Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-fuchsia-500/15 via-cyan-500/20 to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full mx-auto relative z-10 text-center flex flex-col items-center">
          {/* Features Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center mb-14 sm:mb-16"
          >
            {/* Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight flex items-center gap-3">
              <span
                className="text-cyan-300"
                style={{
                  textShadow:
                    "0 0 15px rgba(0, 240, 255, 0.9), 0 0 35px rgba(0, 240, 255, 0.5)",
                }}
              >
                Mitra
              </span>
              <span
                className="bg-gradient-to-r from-[#ff1a7d] via-[#ff5b79] to-[#ff9838] bg-clip-text text-transparent"
                style={{
                  filter: "drop-shadow(0 0 25px rgba(255, 26, 125, 0.8))",
                }}
              >
                Features
              </span>
            </h2>

            {/* Mini Speech Bubbles */}
            <div className="flex items-center gap-1 mt-2.5">
              <div className="w-5 h-5 rounded-lg rounded-bl-none bg-gradient-to-tr from-[#ff1361] to-[#ff9000] p-[1px] shadow-[0_0_10px_rgba(255,19,97,0.8)]">
                <div className="w-full h-full bg-[#1b0826] rounded-lg rounded-bl-none flex items-center justify-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-pink-300" />
                  <span className="w-1 h-1 rounded-full bg-pink-300" />
                </div>
              </div>
              <div className="w-6 h-6 rounded-lg rounded-br-none bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] p-[1px] -ml-1.5 -mt-1 shadow-[0_0_12px_rgba(0,242,254,0.9)]">
                <div className="w-full h-full bg-[#051c2c] rounded-lg rounded-br-none flex items-center justify-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-cyan-200" />
                  <span className="w-1 h-1 rounded-full bg-cyan-200" />
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p
              className="text-base sm:text-xl font-medium text-[#38e1ff] tracking-wide mt-3 max-w-xl"
              style={{
                textShadow:
                  "0 0 10px rgba(56, 225, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)",
              }}
            >
              Everything you need for a seamless and secure real-time chat
              experience.
            </p>
          </motion.div>

          {/* 5 Core Feature Cards Grid (Video Calling Removed as Requested) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 w-full"
          >
            {/* Feature 1: Real-time Messaging */}
            <div
              className="relative rounded-2xl p-8 text-center flex flex-col items-center backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group"
              style={{
                borderColor: "rgba(0, 240, 255, 0.5)",
                boxShadow:
                  "0 0 25px rgba(0, 240, 255, 0.18), inset 0 0 15px rgba(0, 240, 255, 0.05)",
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-300 text-3xl mb-4 shadow-[0_0_20px_rgba(0,240,255,0.5)] group-hover:scale-110 transition-transform">
                <HiChatAlt2 />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Real-time Messaging
              </h3>
              <p className="text-cyan-100/70 text-sm mt-2 leading-relaxed">
                Instant messages with Socket.IO technology.
              </p>
            </div>

            {/* Feature 2: Secure JWT Authentication */}
            <div
              className="relative rounded-2xl p-8 text-center flex flex-col items-center backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group"
              style={{
                borderColor: "rgba(255, 42, 133, 0.5)",
                boxShadow:
                  "0 0 25px rgba(255, 42, 133, 0.18), inset 0 0 15px rgba(255, 42, 133, 0.05)",
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 text-3xl mb-4 shadow-[0_0_20px_rgba(255,42,133,0.5)] group-hover:scale-110 transition-transform">
                <HiLockClosed />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Secure JWT Authentication
              </h3>
              <p className="text-fuchsia-100/70 text-sm mt-2 leading-relaxed">
                Your data stays protected with JWT & HTTP-only cookies.
              </p>
            </div>

            {/* Feature 3: Online Status */}
            <div
              className="relative rounded-2xl p-8 text-center flex flex-col items-center backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group"
              style={{
                borderColor: "rgba(59, 130, 246, 0.5)",
                boxShadow:
                  "0 0 25px rgba(59, 130, 246, 0.18), inset 0 0 15px rgba(59, 130, 246, 0.05)",
              }}
            >
              <div className="relative w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400 flex items-center justify-center text-blue-300 text-3xl mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
                <HiUserGroup />
                <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] border border-[#0b1033]" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Online Status
              </h3>
              <p className="text-blue-100/70 text-sm mt-2 leading-relaxed">
                See who's online and available in real-time.
              </p>
            </div>

            {/* Feature 4: Media & File Sharing */}
            <div
              className="relative rounded-2xl p-8 text-center flex flex-col items-center backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group lg:col-span-1"
              style={{
                borderColor: "rgba(168, 85, 247, 0.5)",
                boxShadow:
                  "0 0 25px rgba(168, 85, 247, 0.18), inset 0 0 15px rgba(168, 85, 247, 0.05)",
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-400 flex items-center justify-center text-purple-300 text-3xl mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                <HiPhotograph />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Media & File Sharing
              </h3>
              <p className="text-purple-100/70 text-sm mt-2 leading-relaxed">
                Share images, files and more with ease.
              </p>
            </div>

            {/* Feature 5: One-to-One Chat */}
            <div
              className="relative rounded-2xl p-8 text-center flex flex-col items-center backdrop-blur-xl bg-[#0b1033]/60 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group md:col-span-2 lg:col-span-2"
              style={{
                borderColor: "rgba(6, 182, 212, 0.5)",
                boxShadow:
                  "0 0 25px rgba(6, 182, 212, 0.18), inset 0 0 15px rgba(6, 182, 212, 0.05)",
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-300 text-3xl mb-4 shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform">
                <HiUsers />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                One-to-One Chat
              </h3>
              <p className="text-cyan-100/70 text-sm mt-2 leading-relaxed">
                Private and direct conversations with seamless instant synchronization.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOOTER ACCENT                                                         */}
      {/* ========================================================================= */}
      <footer className="w-full py-6 bg-[#02030d] border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-12 text-xs text-cyan-300/50">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <img
            src="/mitra-logo.svg"
            alt="Mitra Logo"
            className="w-5 h-5 object-contain"
          />
          <span className="font-bold text-cyan-300 tracking-wider">MITRA</span>
          <span>• Real-Time Cyber Matrix</span>
        </div>
        <p>© {new Date().getFullYear()} Mitra. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;




