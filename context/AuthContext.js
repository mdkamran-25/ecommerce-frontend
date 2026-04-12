import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        // Decode JWT to get user info
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
        Cookies.remove("accessToken");
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
