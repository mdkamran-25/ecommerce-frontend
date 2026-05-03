/**
 * services/cartService.ts
 * Shopping cart API service (TypeScript)
 */

import api from "./api";

export const getCart = (): Promise<any> => api.get("/cart");

export const getCartWithPricing = (): Promise<any> => api.get("/cart/pricing");

export const addToCart = (
  productId: string | number,
  quantity: number,
  selectedSize?: string,
  selectedColor?: string,
  selectedCapacity?: string,
): Promise<any> =>
  api.post("/cart/add", {
    productId,
    quantity,
    selectedSize,
    selectedColor,
    selectedCapacity,
  });

export const updateCartItem = (
  itemId: string | number,
  quantity: number,
): Promise<any> => api.put(`/cart/${itemId}`, { quantity });

export const removeFromCart = (itemId: string | number): Promise<any> =>
  api.delete(`/cart/${itemId}`);

export const clearCart = (): Promise<any> => api.delete("/cart");

export const applyCoupon = (couponCode: string): Promise<any> =>
  api.post("/cart/coupon", { couponCode });

export const removeCoupon = (): Promise<any> => api.delete("/cart/coupon");

export const validateCartStock = (): Promise<any> =>
  api.post("/cart/validate-stock");
