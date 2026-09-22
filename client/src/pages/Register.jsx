import React from "react";
import toast from "react-hot-toast";
import api from "../config/api";
import { Link } from "react-router-dom";
import { useState } from "react";
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      Error.email = "Use proper email format";
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      Error.mobileNumber = "Only Indian mobile numbers allowed";
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

    if (!validate()) {
      setIsLoading(false);
      toast.error("Fill the form correctly");
      return;
    }
    try {
      const res = await api.post("/auth/register", formData);
      toast.success(res.data.message);
      handleClearForm();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-10">
        <div className="w-full max-w-xl">
          {/* Branding */}
          <div className="text-center mb-6">
            <span className="text-6xl">✨</span>
            <h2 className="text-3xl font-extrabold mt-3 text-base-content">
              Create Account
            </h2>
            <p className="text-base-content/50 mt-1">
              Join Mingo and start chatting
            </p>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body gap-4">
              <form
                onSubmit={handleSubmit}
                onReset={handleClearForm}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`input input-bordered w-full ${validationError.fullName ? "input-error" : ""}`}
                  />
                  {validationError.fullName && (
                    <p className="text-error text-xs mt-1">
                      {validationError.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`input input-bordered w-full ${validationError.email ? "input-error" : ""}`}
                  />
                  {validationError.email && (
                    <p className="text-error text-xs mt-1">
                      {validationError.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    placeholder="9876543210"
                    maxLength="10"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`input input-bordered w-full ${validationError.mobileNumber ? "input-error" : ""}`}
                  />
                  {validationError.mobileNumber && (
                    <p className="text-error text-xs mt-1">
                      {validationError.mobileNumber}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      disabled={isLoading}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-base-content/70">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`input input-bordered w-full ${validationError.confirmPassword ? "input-error" : ""}`}
                    />
                    {validationError.confirmPassword && (
                      <p className="text-error text-xs mt-1">
                        {validationError.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="reset"
                    disabled={isLoading}
                    className="btn btn-ghost flex-1"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary flex-1"
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-base-content/50">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-base-content/30 mt-5">
            🔒 We respect your privacy
          </p>
        </div>
      </div>{" "}
    </>
  );
};

export default Register;
