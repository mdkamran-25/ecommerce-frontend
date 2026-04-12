import api from "./api";

export const signup = (firstName, lastName, email, password) =>
  api.post("/auth/signup", { firstName, lastName, email, password });

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const logout = () => api.post("/auth/logout");

export const refreshToken = () => api.post("/auth/refresh");

export const updateProfile = (firstName, lastName) =>
  api.put("/auth/profile", { firstName, lastName });

export const changePassword = (currentPassword, newPassword) =>
  api.put("/auth/change-password", { currentPassword, newPassword });
