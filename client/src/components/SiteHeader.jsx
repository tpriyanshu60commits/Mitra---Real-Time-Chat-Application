import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SiteHeader = () => {
  const [user, isLogin] = useState(false);
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("mingoTheme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setSelectedTheme(savedTheme);
  }, []);

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    setSelectedTheme(theme);
    localStorage.setItem("mingoTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <>
      <div className="navbar bg-primary text-primary-content shadow-lg px-4 sticky top-0 z-50">
        <div className="navbar-start">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-2xl">💬</span>
            <span className="text-xl font-extrabold tracking-tight">Mitra</span>
          </div>
        </div>

        <div className="navbar-end gap-2">
          {isLogin ? (
            <div
              className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-primary-content/10 transition"
              onClick={() => navigate("/dashboard")}
            >
              <div className="avatar avatar-placeholder">
                <div className="size-8 rounded-full bg-primary-content/20 text-primary font-bold text-sm flex items-center justify-center">
                  {(
                    user?.fullName?.[0] ||
                    user?.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </div>
              </div>
              <span className="font-semibold text-sm hidden sm:block">
                {user?.fullName?.split(" ")[0] || user?.email?.split("@")[0]}
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-outline text-primary-content border border-primary-content/40"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn btn-sm bg-primary-content text-primary font-semibold hover:opacity-90"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          )}

          <select
            className="select select-sm bg-primary/60 text-primary-content border-primary-content/30 w-fit"
            value={selectedTheme}
            onChange={handleThemeChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="black">Black</option>
            <option value="spotify">Spotify</option>
            <option value="claude">Claude</option>
            <option value="corporate">Corporate</option>
            <option value="ghibli">Ghibli</option>
            <option value="halloween">Halloween</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default SiteHeader;
