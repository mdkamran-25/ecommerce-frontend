import api from "./api";

export const createOrder = (
  shippingAddressId,
  discountAmount = 0,
  couponCode = "",
  paymentMethod = "RAZORPAY",
) =>
  api.post("/orders", {
    shippingAddressId,
    discountAmount,
    couponCode,
    paymentMethod,
  });

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

export const confirmCODPayment = (orderId) =>
  api.post("/payments/cod/confirm", { orderId });

export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`);

// Shipping & Tracking
export const getShippingDetails = (orderId) =>
  api.get(`/shipping/orders/${orderId}/details`);

export const trackOrder = (orderId) =>
  api.get(`/shipping/orders/${orderId}/track`);

export const getOrderTimeline = (orderId) =>
  api.get(`/shipping/orders/${orderId}/timeline`);

// Addresses
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
