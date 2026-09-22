import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { user, isLogin, setUser, setIsLogin } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [user]);

  if (!isLogin) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl p-10 text-center gap-4">
          <span className="text-5xl">🔒</span>
          <h1 className="text-2xl font-bold text-error">Unauthorized</h1>
          <p className="text-base-content/60">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put("/user/profile", {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
      });

      if (response.data.data) {
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        sessionStorage.setItem("AppUser", JSON.stringify(updatedUser));
        setSuccess(response.data.message || "Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("AppUser");
    setIsLogin(false);
    navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {error && (
          <div className="alert alert-error shadow-sm">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success shadow-sm">
            <span>{success}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center gap-3">
            <div className="avatar avatar-placeholder">
              <div className="size-20 rounded-full bg-primary text-primary-content text-3xl font-extrabold flex items-center justify-center">
                {(user?.fullName?.[0] || user?.email?.[0] || "U").toUpperCase()}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">{user?.fullName || "User"}</h2>
              <p className="text-base-content/50 text-sm">{user?.email}</p>
            </div>
            <span className={`badge ${
              user?.loginType === "google_user" ? "badge-info" :
              user?.loginType === "hybrid_user" ? "badge-warning" : "badge-primary"
            }`}>
              {user?.loginType === "google_user" ? "Google Account" :
               user?.loginType === "hybrid_user" ? "Hybrid Account" : "Standard Account"}
            </span>
          </div>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body gap-5">
              <h3 className="text-lg font-semibold text-base-content">Profile Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-base-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-base-content/40 mb-1">Full Name</p>
                  <p className="text-base font-medium text-base-content">{user?.fullName || "—"}</p>
                </div>
                <div className="bg-base-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-base-content/40 mb-1">Email</p>
                  <p className="text-base font-medium text-base-content truncate">{user?.email || "—"}</p>
                </div>
                <div className="bg-base-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-base-content/40 mb-1">Mobile Number</p>
                  <p className="text-base font-medium text-base-content">{user?.mobileNumber || "—"}</p>
                </div>
                {user?.createdAt && (
                  <div className="bg-base-200 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase text-base-content/40 mb-1">Member Since</p>
                    <p className="text-base font-medium text-base-content">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button onClick={handleEdit} className="btn btn-primary w-full">
                  Edit Profile
                </button>
                <button onClick={handleLogout} className="btn btn-outline btn-error w-full">
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body gap-4">
              <h3 className="text-lg font-semibold text-base-content">Edit Profile</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-base-content/70">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success flex-1"
                  >
                    {loading ? <span className="loading loading-spinner loading-sm" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
    
