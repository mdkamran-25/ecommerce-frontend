/**
 * services/authService.ts
 * Authentication API service (TypeScript)
 */

import api from "./api";
import { ApiResponse } from "../types";

interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

export const signup = (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<any> =>
  api.post("/auth/signup", { firstName, lastName, email, password });

export const login = (email: string, password: string): Promise<any> =>
  api.post("/auth/login", { email, password });

export const logout = (): Promise<any> => api.post("/auth/logout");

export const refreshToken = (): Promise<any> => api.post("/auth/refresh");

export const updateProfile = (
  firstName: string,
  lastName: string,
): Promise<any> => api.put("/auth/profile", { firstName, lastName });

export const changePassword = (
  currentPassword: string,
  newPassword: string,
): Promise<any> =>
  api.put("/auth/change-password", { currentPassword, newPassword });
