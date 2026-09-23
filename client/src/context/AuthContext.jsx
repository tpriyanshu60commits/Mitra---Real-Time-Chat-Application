import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

const getInitialUser = () => {
  try {
    const raw = sessionStorage.getItem("AppUser") || localStorage.getItem("AppUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const isLogin = !!user;

  const setIsLogin = (status) => {
    if (!status) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("AppUser", JSON.stringify(user));
      localStorage.setItem("AppUser", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("AppUser");
      localStorage.removeItem("AppUser");
    }
  }, [user]);

  const value = {
    user,
    setUser,
    isLogin,
    setIsLogin,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

