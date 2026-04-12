import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to access AuthContext
 * Provides user authentication state and functions
 * @returns {Object} AuthContext value with user, loading, authLoading, error, login, signup, logout
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export default useAuth;
