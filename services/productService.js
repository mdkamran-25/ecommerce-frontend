import api from "./api";

export const getProducts = (category, search, page = 1, limit = 10) =>
  api.get("/products", { params: { category, search, page, limit } });

export const getProduct = (id) => api.get(`/products/${id}`);

export const getCategories = () => api.get("/products/categories/list");
