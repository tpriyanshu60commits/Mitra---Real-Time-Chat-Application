import axios from "axios";
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:4500"}/api`,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    try {
      const stored = sessionStorage.getItem("AppUser");
      if (stored) {
        const appUser = JSON.parse(stored);
        if (appUser?.token) {
          config.headers.Authorization = `Bearer ${appUser.token}`;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
