import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const createReviewService = () => {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Add token to requests
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    // Get all reviews for a product
    getProductReviews: async (productId, page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/reviews/product/${productId}`, {
          params: { page, limit },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Get product rating statistics
    getProductStats: async (productId) => {
      try {
        const response = await apiClient.get(`/reviews/stats/${productId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Get user's review for a product
    getUserProductReview: async (productId) => {
      try {
        const response = await apiClient.get(
          `/reviews/product/${productId}/my-review`,
        );
        return response.data;
      } catch (error) {
        // Return null if user has no review instead of throwing
        if (error.response?.status === 404) {
          return { data: null };
        }
        throw error.response?.data || { error: error.message };
      }
    },

    // Create or update a review
    createReview: async (productId, { rating, title, comment }) => {
      try {
        const response = await apiClient.post(`/reviews/product/${productId}`, {
          rating,
          title,
          comment,
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Delete a review
    deleteReview: async (reviewId) => {
      try {
        const response = await apiClient.delete(`/reviews/${reviewId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: error.message };
      }
    },
  };
};

export default createReviewService();
