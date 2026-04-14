/**
 * context/AuthContext.tsx
 * Authentication context with TypeScript
 */

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  JSX,
} from "react";
import Cookies from "js-cookie";
import * as authService from "../services/authService";
import { User } from "../types";

interface DecodedToken extends Partial<User> {
  exp?: number;
  role?: "CUSTOMER" | "ADMIN" | "user" | "admin";
}

interface AuthContextType {
  user: DecodedToken | null;
  setUser: Dispatch<SetStateAction<DecodedToken | null>>;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    try {
      const token = Cookies.get("accessToken");
      if (token) {
        // Decode JWT to get user info
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }

        const decoded = JSON.parse(atob(parts[1])) as DecodedToken;
        console.log("🔐 Session restored from cookie:", decoded);

        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          console.warn("⚠️ Token expired, clearing session");
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          setUser(null);
        } else if (decoded.role === "CUSTOMER") {
          // Only accept CUSTOMER role, reject ADMIN tokens
          setUser(decoded);
          console.log("✅ Customer session active");
        } else {
          // Reject non-customer tokens (e.g., ADMIN tokens)
          console.warn("⚠️ Admin token detected, clearing");
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          setUser(null);
        }
      } else {
        console.log("ℹ️ No token found, user not logged in");
        setUser(null);
      }
    } catch (err) {
      console.error("❌ Session restoration error:", err);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup function
  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<any> => {
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
      const decoded = JSON.parse(
        atob(data.data.accessToken.split(".")[1]),
      ) as DecodedToken;

      // Validate role is CUSTOMER
      if (decoded.role !== "CUSTOMER") {
        throw new Error("Only customer accounts are allowed");
      }

      setUser(decoded);

      return data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Sign up failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<any> => {
    try {
      setAuthLoading(true);
      setError(null);

      console.log("🔐 Attempting login for:", email);

      const response = await authService.login(email, password);
      console.log("✅ Login response:", response);

      const { data } = response;

      // Validate response structure
      if (!data?.data?.accessToken) {
        console.error("❌ Invalid response structure:", data);
        throw new Error("Invalid login response from server (missing tokens)");
      }

      console.log("📦 Response data:", data);

      // Store tokens
      Cookies.set("accessToken", data.data.accessToken);
      Cookies.set("refreshToken", data.data.refreshToken);
      console.log("✅ Tokens stored in cookies");

      // Decode and set user
      try {
        const tokenParts = data.data.accessToken.split(".");
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format (not 3 parts)");
        }
        const decoded = JSON.parse(atob(tokenParts[1])) as DecodedToken;
        console.log("✅ Token decoded:", decoded);

        // Validate role is CUSTOMER
        if (decoded.role !== "CUSTOMER") {
          console.warn("⚠️ Non-customer role detected:", decoded.role);
          // Clear admin tokens if trying to login with admin account
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          throw new Error(
            "Admin accounts cannot log in to the customer portal",
          );
        }

        setUser(decoded);
        console.log("✅ User set in context:", decoded);
      } catch (decodeErr: any) {
        console.error("❌ Token decode error:", decodeErr);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        throw new Error(`Failed to decode login token: ${decodeErr.message}`);
      }

      return data;
    } catch (err: any) {
      console.error("❌ Login error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
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

  const value: AuthContextType = {
    user,
    setUser,
    loading,
    authLoading,
    error,
    setError,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
