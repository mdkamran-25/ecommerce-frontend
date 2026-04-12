import api from "./api";

export const createOrder = (shippingAddressId, discountAmount = 0) =>
  api.post("/orders", { shippingAddressId, discountAmount });

export const getOrders = (page = 1, limit = 10) =>
  api.get("/orders", { params: { page, limit } });

export const getOrder = (orderId) => api.get(`/orders/${orderId}`);

export const createPaymentOrder = (orderId) =>
  api.post("/payments/create-order", { orderId });

export const verifyPayment = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) =>
  api.post("/payments/verify", {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`);

export const getAddresses = () => api.get("/addresses");

export const createAddress = (
  type,
  fullName,
  street,
  city,
  state,
  postalCode,
  phone,
) =>
  api.post("/addresses", {
    type,
    fullName,
    street,
    city,
    state,
    postalCode,
    phone,
  });

export const updateAddress = (addressId, data) =>
  api.put(`/addresses/${addressId}`, data);

export const deleteAddress = (addressId) =>
  api.delete(`/addresses/${addressId}`);
