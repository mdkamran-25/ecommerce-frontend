/**
 * types/index.ts
 * Global TypeScript type definitions
 */

export interface Product {
  id: string | number;
  name: string;
  images?: string[];
  price?: number;
  compareAt?: number;
  category?: string;
  description?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface User {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: "CUSTOMER" | "ADMIN" | "user" | "admin";
}

export interface Order {
  id: string | number;
  userId: string | number;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export type SortOrder = "asc" | "desc";

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  perPage?: number;
}
