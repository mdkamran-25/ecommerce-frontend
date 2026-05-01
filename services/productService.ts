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
    filters?: any,
  ): Promise<ApiPaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add all filter parameters
      if (filters?.category) params.append("category", filters.category);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.priceMin)
        params.append("priceMin", filters.priceMin.toString());
      if (filters?.priceMax)
        params.append("priceMax", filters.priceMax.toString());
      if (filters?.sizes) {
        (Array.isArray(filters.sizes)
          ? filters.sizes
          : [filters.sizes]
        ).forEach((size) => params.append("sizes", size));
      }
      if (filters?.colors) {
        (Array.isArray(filters.colors)
          ? filters.colors
          : [filters.colors]
        ).forEach((color) => params.append("colors", color));
      }
      if (filters?.inStock) params.append("inStock", filters.inStock);
      if (filters?.minRating)
        params.append("minRating", filters.minRating.toString());
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

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

  /**
   * Get all available filters with counts
   */
  async getFilters(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/filters/all`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching filters:", error);
      return { success: false, error: "Failed to fetch filters" };
    }
  },

  /**
   * Get all variants for a product
   */
  async getProductVariants(productId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/variants`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching variants:", error);
      return { success: false, error: "Failed to fetch variants" };
    }
  },
};

export default productService;
