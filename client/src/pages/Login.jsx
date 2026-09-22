import React from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGoogleAuth } from "../config/GoogleAuth";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();
  const { isLoading, error, isInitialized, signInWithGoogle } = useGoogleAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
    <>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-base-200 px-4">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-6">
            <span className="text-6xl">💬</span>
            <h2 className="text-3xl font-extrabold mt-3 text-base-content">
              Welcome back
            </h2>
            <p className="text-base-content/50 mt-1">
              Sign in to your Mingo account
            </p>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body gap-5">
              <form
                onSubmit={handleSubmit}
                onReset={handleClearForm}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="reset"
                    disabled={loading}
                    className="btn btn-ghost flex-1"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>

              <div className="divider text-base-content/40 text-xs my-0">
                OR
              </div>

              {/* Google Login */}
              {error ? (
                <button
                  className="btn btn-outline btn-error w-full gap-2"
                  disabled
                >
                  <FcGoogle className="text-xl" />
                  {error}
                </button>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="btn btn-outline w-full gap-2"
                  disabled={!isInitialized || isLoading || loading}
                >
                  <FcGoogle className="text-xl" />
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : isInitialized ? (
                    "Continue with Google"
                  ) : (
                    "Google Auth Error"
                  )}
                </button>
              )}

              <p className="text-center text-sm text-base-content/50">
                No account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-base-content/30 mt-5">
            🔐 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
