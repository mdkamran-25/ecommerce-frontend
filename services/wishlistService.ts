/**
 * Wishlist Service
 * Handles all wishlist API calls
 */

import api from "./api";

export const wishlistService = {
  /**
   * Get user's wishlist
   */
  async getWishlist() {
    return api.get("/wishlist");
  },

  /**
   * Check if product is in wishlist
   */
  async checkWishlistItem(productId: string) {
    return api.get(`/wishlist/check/${productId}`);
  },

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string) {
    return api.post("/wishlist", { productId });
  },

  /**
   * Remove product from wishlist by wishlist item ID
   */
  async removeFromWishlist(wishlistItemId: string) {
    return api.delete(`/wishlist/${wishlistItemId}`);
  },

  /**
   * Remove product from wishlist by product ID
   */
  async removeFromWishlistByProductId(productId: string) {
    return api.delete(`/wishlist/product/${productId}`);
  },

  /**
   * Clear entire wishlist
   */
  async clearWishlist() {
    return api.delete("/wishlist");
  },
};

export default wishlistService;
