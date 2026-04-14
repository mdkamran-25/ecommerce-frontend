import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry 401 if:
    // 1. It hasn't been retried yet
    // 2. User has a valid token (not on login/signup)
    // 3. Not a login/signup/forgot-password/reset-password/logout request
    const isAuthRequest =
      originalRequest.url?.includes("login") ||
      originalRequest.url?.includes("signup") ||
      originalRequest.url?.includes("forgot-password") ||
      originalRequest.url?.includes("reset-password") ||
      originalRequest.url?.includes("verify-email") ||
      originalRequest.url?.includes("logout") ||
      originalRequest.url?.includes("refresh");

    const hasToken = Cookies.get("accessToken");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      hasToken &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;
      try {
        console.log("🔄 Token expired, attempting refresh...");
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // Fixed: response.data contains accessToken directly, not nested in data
        const { accessToken } = response.data;
        if (!accessToken) {
          throw new Error("No accessToken in refresh response");
        }

        console.log("✅ Token refreshed successfully");
        Cookies.set("accessToken", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
