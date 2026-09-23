import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const SiteHeader = () => {
  const { user, isLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050716]/90 backdrop-blur-lg border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="w-full px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => handleNav("/")}
        >
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.7)] group-hover:scale-105 transition-transform">
            <span className="text-base">💬</span>
          </div>
          <span
            className="text-2xl font-black tracking-tight text-cyan-300"
            style={{
              textShadow:
                "0 0 12px rgba(0, 240, 255, 0.8), 0 0 25px rgba(0, 240, 255, 0.4)",
            }}
          >
            Mitra
          </span>
        </div>

        {/* Desktop Navigation Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isLogin ? (
            <>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-400/50 hover:bg-cyan-500/20 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all cursor-pointer"
                onClick={() => handleNav("/chat")}
              >
                Open Chat 🚀
              </button>

              <div
                className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
                onClick={() => handleNav("/dashboard")}
              >
                <div className="avatar avatar-placeholder">
                  <div className="size-7 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.6)] overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Avatar"
                        className="size-full object-cover"
                      />
                    ) : (
                      (
                        user?.fullName?.[0] ||
                        user?.email?.[0] ||
                        "U"
                      ).toUpperCase()
                    )}
                  </div>
                </div>
                <span className="font-semibold text-xs text-cyan-200">
                  {user?.fullName?.split(" ")[0] || user?.email?.split("@")[0]}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-400/50 hover:bg-cyan-500/20 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all cursor-pointer"
                onClick={() => handleNav("/login")}
              >
                Login
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-300 hover:shadow-[0_0_18px_rgba(0,240,255,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                onClick={() => handleNav("/register")}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-300 hover:shadow-[0_0_12px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <HiX className="text-2xl" />
            ) : (
              <HiMenuAlt3 className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden w-full px-4 py-4 bg-[#050716]/98 border-t border-cyan-500/20 flex flex-col gap-3">
          {isLogin ? (
            <>
              <div
                className="flex items-center gap-3 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 cursor-pointer"
                onClick={() => handleNav("/dashboard")}
              >
                <div className="size-8 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Avatar"
                      className="size-full object-cover"
                    />
                  ) : (
                    (
                      user?.fullName?.[0] ||
                      user?.email?.[0] ||
                      "U"
                    ).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-cyan-200">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-cyan-400/60">{user?.email}</p>
                </div>
              </div>

              <button
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                onClick={() => handleNav("/chat")}
              >
                Open Chat 🚀
              </button>

              <button
                className="w-full py-2.5 rounded-xl font-bold text-sm text-cyan-300 bg-cyan-950/40 border border-cyan-500/40"
                onClick={() => handleNav("/contact")}
              >
                Contact Us
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full py-2.5 rounded-xl font-bold text-sm text-cyan-300 bg-cyan-950/40 border border-cyan-500/40"
                onClick={() => handleNav("/login")}
              >
                Login
              </button>
              <button
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                onClick={() => handleNav("/register")}
              >
                Register
              </button>
              <button
                className="w-full py-2.5 rounded-xl font-bold text-sm text-cyan-300 bg-cyan-950/40 border border-cyan-500/40"
                onClick={() => handleNav("/contact")}
              >
                Contact Us
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default SiteHeader;


