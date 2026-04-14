import api from "./api";

export const getCart = () => api.get("/cart");

export const getCartWithPricing = () => api.get("/cart/pricing");

export const addToCart = (productId, quantity) =>
  api.post("/cart/add", { productId, quantity });

export const updateCartItem = (itemId, quantity) =>
  api.put(`/cart/${itemId}`, { quantity });

export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);

export const clearCart = () => api.delete("/cart");

export const applyCoupon = (couponCode) =>
  api.post("/cart/coupon", { couponCode });

export const removeCoupon = () => api.delete("/cart/coupon");

export const validateCartStock = () => api.post("/cart/validate-stock");
