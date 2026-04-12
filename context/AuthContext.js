import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        // Decode JWT to get user info
        const decoded = JSON.parse(atob(token.split(".")[1]));

        // Only accept CUSTOMER role, reject ADMIN tokens
        if (decoded.role === "CUSTOMER") {
          setUser(decoded);
        } else {
          // Reject non-customer tokens (e.g., ADMIN tokens)
          console.warn("Admin token detected in customer context. Clearing.");
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
      }
    }
    setLoading(false);
  }, []);

  // Signup function
  const signup = async (firstName, lastName, email, password) => {
    try {
      setAuthLoading(true);
      setError(null);

      const { data } = await authService.signup(
        firstName,
        lastName,
        email,
        password,
      );

      // Store tokens
      Cookies.set("accessToken", data.data.accessToken);
      Cookies.set("refreshToken", data.data.refreshToken);

      // Decode and set user
      const decoded = JSON.parse(atob(data.data.accessToken.split(".")[1]));

      // Validate role is CUSTOMER
      if (decoded.role !== "CUSTOMER") {
        throw new Error("Only customer accounts are allowed");
      }

      setUser(decoded);

      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Sign up failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setError(null);

      const { data } = await authService.login(email, password);

      // Store tokens
      Cookies.set("accessToken", data.data.accessToken);
      Cookies.set("refreshToken", data.data.refreshToken);

      // Decode and set user
      const decoded = JSON.parse(atob(data.data.accessToken.split(".")[1]));

      // Validate role is CUSTOMER
      if (decoded.role !== "CUSTOMER") {
        // Clear admin tokens if trying to login with admin account
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        throw new Error("Admin accounts cannot log in to the customer portal");
      }

      setUser(decoded);

      return data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthLoading(true);
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setAuthLoading(false);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authLoading,
        error,
        setError,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
