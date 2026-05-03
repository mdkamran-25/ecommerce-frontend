/**
 * Wishlist Context
 * Manages wishlist state and operations
 */

import React, { createContext, useState, useEffect, useCallback } from "react";
import wishlistService from "../services/wishlistService";
import { toast } from "react-toastify";

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    compareAt?: number;
    stock: number;
    images?: string[];
    description?: string;
    sku?: string;
    category?: { name: string };
    vendor?: string;
    weight?: number;
    dimensions?: string;
    variants?: Array<{
      id: string;
      type: string;
      value: string;
      stock: number;
    }>;
  };
}

export interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch wishlist from API
   */
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      if (response.data.success) {
        setWishlist(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load wishlist on component mount
   */
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /**
   * Check if product is in wishlist
   */
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlist.some((item) => item.productId === productId);
    },
    [wishlist],
  );

  /**
   * Add product to wishlist
   */
  const addToWishlist = useCallback(
    async (productId: string) => {
      if (isInWishlist(productId)) {
        toast.info("Product already in wishlist");
        return;
      }

      try {
        const response = await wishlistService.addToWishlist(productId);
        if (response.data.success) {
          setWishlist((prev) => [response.data.data, ...prev]);
          toast.success("Added to wishlist!");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to add to wishlist");
      }
    },
    [isInWishlist],
  );

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      await wishlistService.removeFromWishlistByProductId(productId);
      setWishlist((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
      toast.success("Removed from wishlist");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to remove from wishlist",
      );
    }
  }, []);

  /**
   * Clear entire wishlist
   */
  const clearWishlistHandler = useCallback(async () => {
    if (!window.confirm("Are you sure you want to clear your wishlist?")) {
      return;
    }

    try {
      const response = await wishlistService.clearWishlist();
      if (response.data.success) {
        setWishlist([]);
        toast.success("Wishlist cleared");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to clear wishlist");
    }
  }, []);

  /**
   * Refresh wishlist from API
   */
  const refreshWishlist = useCallback(() => {
    return fetchWishlist();
  }, [fetchWishlist]);

  const value: WishlistContextType = {
    wishlist,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist: clearWishlistHandler,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
