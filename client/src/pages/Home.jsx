import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
  return (
    <>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-base-200 px-4 py-12 text-center">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="text-7xl">💬</span>
          <h1 className="text-5xl font-extrabold mt-4 text-base-content">
            Welcome to <span className="text-primary">Mingo</span>
          </h1>
          <p className="text-base-content/50 mt-3 text-lg max-w-md mx-auto">
            Connect instantly. Chat securely. Stay together.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            {
              icon: "⚡",
              title: "Real-time",
              desc: "Instant delivery with WebSocket technology",
            },
            {
              icon: "🔒",
              title: "Secure",
              desc: "Google OAuth & JWT protected authentication",
            },
            {
              icon: "🎨",
              title: "Themeable",
              desc: "Choose from 8 beautiful built-in themes",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="card bg-base-100 shadow-md p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-bold text-lg text-base-content">{title}</h3>
              <p className="text-base-content/50 text-sm mt-1">{desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default Home;
