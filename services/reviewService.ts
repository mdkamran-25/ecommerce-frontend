/**
 * services/reviewService.ts
 * Reviews API service (TypeScript)
 */

import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface ReviewData {
  rating: number;
  title: string;
  comment: string;
}

interface ReviewService {
  getProductReviews: (
    productId: string | number,
    page?: number,
    limit?: number,
  ) => Promise<any>;
  getProductStats: (productId: string | number) => Promise<any>;
  getUserProductReview: (productId: string | number) => Promise<any>;
  createReview: (
    productId: string | number,
    reviewData: ReviewData,
  ) => Promise<any>;
  deleteReview: (reviewId: string | number) => Promise<any>;
}

const createReviewService = (): ReviewService => {
  const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Add token to requests
  apiClient.interceptors.request.use((config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    // Get all reviews for a product
    getProductReviews: async (
      productId: string | number,
      page: number = 1,
      limit: number = 10,
    ): Promise<any> => {
      try {
        const response = await apiClient.get(`/reviews/product/${productId}`, {
          params: { page, limit },
        });
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Get product rating statistics
    getProductStats: async (productId: string | number): Promise<any> => {
      try {
        const response = await apiClient.get(`/reviews/stats/${productId}`);
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Get user's review for a product
    getUserProductReview: async (productId: string | number): Promise<any> => {
      try {
        const response = await apiClient.get(
          `/reviews/product/${productId}/my-review`,
        );
        return response.data;
      } catch (error: any) {
        // Return null if user has no review instead of throwing
        if (error.response?.status === 404) {
          return { data: null };
        }
        throw error.response?.data || { error: error.message };
      }
    },

    // Create or update a review
    createReview: async (
      productId: string | number,
      { rating, title, comment }: ReviewData,
    ): Promise<any> => {
      try {
        const response = await apiClient.post(`/reviews/product/${productId}`, {
          rating,
          title,
          comment,
        });
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Delete a review
    deleteReview: async (reviewId: string | number): Promise<any> => {
      try {
        const response = await apiClient.delete(`/reviews/${reviewId}`);
        return response.data;
      } catch (error: any) {
        throw error.response?.data || { error: error.message };
      }
    },
  };
};

export default createReviewService();
