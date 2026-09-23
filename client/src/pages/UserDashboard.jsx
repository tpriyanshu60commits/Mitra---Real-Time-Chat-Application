import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiPencil,
  HiLogout,
  HiChatAlt2,
  HiLockClosed,
  HiCheckCircle,
  HiExclamationCircle,
  HiSparkles,
  HiCamera,
} from "react-icons/hi";

const UserDashboard = () => {
  const { user, isLogin, setUser, setIsLogin } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobileNumber: user?.mobileNumber || "",
  });

  if (!isLogin) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-[#030617] text-white px-4 relative overflow-hidden select-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 blur-[140px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-md w-full p-[2px] rounded-3xl bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 shadow-[0_0_50px_rgba(244,63,94,0.2)]"
        >
          <div className="bg-[#070b24]/95 backdrop-blur-2xl rounded-[22px] p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-400 flex items-center justify-center text-3xl mx-auto shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              <HiLockClosed className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Unauthorized Access</h1>
            <p className="text-cyan-100/70 text-sm">
              Please log in to your Mitra account to access your personal dashboard.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 px-6 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleEdit = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      mobileNumber: user?.mobileNumber || "",
    });
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be under 10MB");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    setUploadingPhoto(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put("/user/profile-pic", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.data) {
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        sessionStorage.setItem("AppUser", JSON.stringify(updatedUser));
        setSuccess(response.data.message || "Profile photo updated successfully!");
        toast.success("Profile photo uploaded to Cloudinary!");
        setTimeout(() => setSuccess(""), 3500);
      }
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      const errMsg =
        err.response?.data?.message || "Failed to upload profile photo to Cloudinary.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put("/user/profile", {
        fullName: formData.fullName,
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
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
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
    <div className="min-h-[calc(100vh-61px)] w-full bg-[#030617] text-white py-10 px-4 sm:px-8 relative overflow-hidden select-none">
      {/* Hidden File Input for Cloudinary Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Background Cyber Ambient Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-[550px] h-[550px] bg-cyan-500/12 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-fuchsia-600/12 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff0d_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 flex items-center gap-3 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
          >
            <HiExclamationCircle className="text-xl shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-3 shadow-[0_0_20px_rgba(52,211,153,0.25)]"
          >
            <HiCheckCircle className="text-xl shrink-0" />
            <span className="text-sm font-semibold">{success}</span>
          </motion.div>
        )}

        {/* ===================================================================== */}
        {/* 1. HERO IDENTITY CARD                                                 */}
        {/* ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-[2px] rounded-3xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_40px_rgba(0,240,255,0.18)]"
        >
          <div className="bg-[#070c28]/90 backdrop-blur-2xl rounded-[22px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative overflow-hidden">
            {/* Ambient Top Light Beam */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

            {/* Glowing Avatar with Cloudinary Photo Upload Trigger */}
            <div className="relative shrink-0 group">
              <div className="p-[3px] rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(0,240,255,0.6)]">
                <div className="size-20 sm:size-24 rounded-full bg-[#050920] overflow-hidden text-cyan-300 font-black text-3xl sm:text-4xl flex items-center justify-center relative">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName || "User Avatar"}
                      className="size-full object-cover object-center"
                    />
                  ) : (
                    <span>
                      {(
                        user?.fullName?.[0] ||
                        user?.email?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </span>
                  )}

                  {/* Upload Overlay on Hover / Loading */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer transition-opacity ${
                      uploadingPhoto
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {uploadingPhoto ? (
                      <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <HiCamera className="text-xl text-cyan-300" />
                        <span>Upload</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] border-2 border-[#050920]" />

              {/* Floating Mini Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change Profile Picture"
                className="absolute -bottom-1 -left-1 size-7 rounded-full bg-[#091238] border border-cyan-400 text-cyan-300 hover:text-white hover:bg-cyan-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.7)] transition-all cursor-pointer"
              >
                <HiCamera className="text-sm" />
              </button>
            </div>

            {/* User Title & Account Type Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user?.fullName || "User"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto sm:mx-0 ${
                    user?.loginType === "google_user"
                      ? "bg-cyan-500/15 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      : user?.loginType === "hybrid_user"
                        ? "bg-amber-500/15 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                        : "bg-fuchsia-500/15 border border-fuchsia-400 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                  }`}
                >
                  <HiSparkles className="text-xs" />
                  {user?.loginType === "google_user"
                    ? "Google Account"
                    : user?.loginType === "hybrid_user"
                      ? "Hybrid Account"
                      : "Standard Account"}
                </span>
              </div>
              <p className="text-cyan-200/70 text-sm font-medium">
                {user?.email}
              </p>

              {/* Photo Upload Hint */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline mt-2 flex items-center gap-1 mx-auto sm:mx-0 cursor-pointer"
              >
                <HiCamera className="text-sm" />
                <span>
                  {user?.profilePic
                    ? "Change Profile Photo"
                    : "Upload Profile Photo"}
                </span>
              </button>
            </div>

            {/* Quick Open Chat CTA */}
            <button
              onClick={() => navigate("/chat")}
              className="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm text-cyan-200 bg-[#091238] border border-cyan-400/50 hover:bg-cyan-500/20 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <HiChatAlt2 className="text-base text-cyan-300" />
              <span>Open Chat</span>
            </button>
          </div>
        </motion.div>

        {/* ===================================================================== */}
        {/* 2. PROFILE DETAILS / EDIT FORM CARD                                   */}
        {/* ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="p-[2px] rounded-3xl bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-fuchsia-500/40 shadow-[0_0_35px_rgba(0,240,255,0.12)]"
        >
          <div className="bg-[#070c28]/90 backdrop-blur-2xl rounded-[22px] p-6 sm:p-8 space-y-6">
            {!isEditing ? (
              /* =============================================================== */
              /* VIEW MODE                                                       */
              /* =============================================================== */
              <>
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span className="text-cyan-400">⚡</span>
                    <span>Profile Information</span>
                  </h3>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-[#091238] border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/15 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <HiPencil className="text-sm" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name Card */}
                  <div className="bg-[#091136]/80 border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-4 transition-all duration-300 text-left">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <HiUser className="text-sm" />
                      <span>Full Name</span>
                    </div>
                    <p className="text-base font-bold text-white">
                      {user?.fullName || "—"}
                    </p>
                  </div>

                  {/* Email Card */}
                  <div className="bg-[#091136]/80 border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-4 transition-all duration-300 text-left">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <HiMail className="text-sm" />
                      <span>Email Address</span>
                    </div>
                    <p className="text-base font-bold text-white truncate">
                      {user?.email || "—"}
                    </p>
                  </div>

                  {/* Mobile Number Card */}
                  <div className="bg-[#091136]/80 border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-4 transition-all duration-300 text-left">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <HiPhone className="text-sm" />
                      <span>Mobile Number</span>
                    </div>
                    <p className="text-base font-bold text-white">
                      {user?.mobileNumber || "—"}
                    </p>
                  </div>

                  {/* Member Since Card */}
                  <div className="bg-[#091136]/80 border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-4 transition-all duration-300 text-left">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <HiCalendar className="text-sm" />
                      <span>Member Since</span>
                    </div>
                    <p className="text-base font-bold text-white">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Active Member"}
                    </p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 px-6 rounded-xl font-bold text-sm text-rose-300 bg-rose-950/30 border border-rose-500/40 hover:bg-rose-900/50 hover:border-rose-400 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HiLogout className="text-base" />
                    <span>Logout Account</span>
                  </button>
                </div>
              </>
            ) : (
              /* =============================================================== */
              /* EDIT MODE                                                       */
              /* =============================================================== */
              <>
                <div className="border-b border-cyan-500/20 pb-4 text-left">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span className="text-cyan-400">✏️</span>
                    <span>Edit Profile Details</span>
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Photo Change Banner in Edit Mode */}
                  <div className="p-4 rounded-2xl bg-[#091136]/90 border border-cyan-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full overflow-hidden bg-[#050920] border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold">
                        {user?.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt="avatar"
                            className="size-full object-cover"
                          />
                        ) : (
                          (user?.fullName?.[0] || "U").toUpperCase()
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">Profile Photo</p>
                        <p className="text-[11px] text-cyan-200/60">
                          JPG, PNG or WebP, up to 10MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <HiCamera className="text-sm" />
                      <span>{uploadingPhoto ? "Uploading..." : "Change Photo"}</span>
                    </button>
                  </div>

                  {/* Full Name Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-cyan-200/90 flex items-center gap-1.5">
                      <HiUser className="text-cyan-400" />
                      <span>Full Name</span>
                    </label>
                    <div className="relative flex items-center bg-[#090f2e]/90 rounded-xl border border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)] transition-all">
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full bg-transparent py-3 px-3.5 text-white placeholder-cyan-200/30 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email Input (Locked / Read-Only) */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-cyan-200/90 flex items-center gap-1.5">
                        <HiMail className="text-cyan-400" />
                        <span>Email Address</span>
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                        <HiLockClosed className="text-[11px]" />
                        <span>Locked</span>
                      </span>
                    </div>
                    <div className="relative flex items-center bg-[#070d26]/80 rounded-xl border border-white/10 opacity-75 cursor-not-allowed">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        disabled
                        tabIndex={-1}
                        className="w-full bg-transparent py-3 px-3.5 text-cyan-100/60 text-sm focus:outline-none cursor-not-allowed select-none"
                      />
                    </div>
                    <p className="text-[10px] text-cyan-200/50 pl-1">
                      Account email is permanent and cannot be modified.
                    </p>
                  </div>

                  {/* Mobile Number Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-cyan-200/90 flex items-center gap-1.5">
                      <HiPhone className="text-cyan-400" />
                      <span>Mobile Number</span>
                    </label>
                    <div className="relative flex items-center bg-[#090f2e]/90 rounded-xl border border-cyan-500/35 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_18px_rgba(0,240,255,0.25)] transition-all">
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your mobile number"
                        className="w-full bg-transparent py-3 px-3.5 text-white placeholder-cyan-200/30 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className="w-1/2 py-3 px-5 rounded-xl font-bold text-sm text-cyan-200 bg-[#091238] border border-cyan-500/40 hover:bg-cyan-500/15 hover:border-cyan-400 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
