/**
 * services/productService.ts
 * API service for product-related endpoints (TypeScript)
 */

import {
  Product,
  Category,
  ApiResponse,
  ApiPaginatedResponse,
  PaginatedResponse,
  FilterOptions,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const productService = {
  /**
   * Get all products with pagination and filtering
   */
  async getProducts(
    page: number = 1,
    limit: number = 50,
    filters?: FilterOptions,
  ): Promise<ApiPaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
        ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, error: "Failed to fetch products" };
    }
  },

  /**
   * Get single product by ID
   */
  async getProduct(id: string | number): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      return { success: false, error: "Failed to fetch product" };
    }
  },

  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, error: "Failed to fetch categories" };
    }
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(
    limit: number = 8,
  ): Promise<ApiResponse<Product[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/featured?limit=${limit}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return { success: false, error: "Failed to fetch featured products" };
    }
  },

  /**
   * Get new products (recently added)
   */
  async getNewProducts(limit: number = 8): Promise<ApiResponse<Product[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/new?limit=${limit}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching new products:", error);
      return { success: false, error: "Failed to fetch new products" };
    }
  },
};

export default productService;
