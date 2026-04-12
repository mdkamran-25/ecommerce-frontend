import api from "./api";

export const getCart = () => api.get("/cart");

export const addToCart = (productId, quantity) =>
  api.post("/cart/add", { productId, quantity });

export const updateCartItem = (itemId, quantity) =>
  api.put(`/cart/${itemId}`, { quantity });

export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);

export const clearCart = () => api.delete("/cart");
