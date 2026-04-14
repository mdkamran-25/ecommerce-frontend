/**
 * services/orderService.ts
 * Orders API service (TypeScript)
 */

import api from "./api";

interface CreateOrderPayload {
  shippingAddressId: string | number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod?: "RAZORPAY" | "COD";
}

interface CreateAddressPayload {
  type: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export const createOrder = (
  shippingAddressId: string | number,
  discountAmount: number = 0,
  couponCode: string = "",
  paymentMethod: string = "RAZORPAY",
): Promise<any> =>
  api.post("/orders", {
    shippingAddressId,
    discountAmount,
    couponCode,
    paymentMethod,
  });

export const getOrders = (page: number = 1, limit: number = 10): Promise<any> =>
  api.get("/orders", { params: { page, limit } });

export const getOrder = (orderId: string | number): Promise<any> =>
  api.get(`/orders/${orderId}`);

export const createPaymentOrder = (orderId: string | number): Promise<any> =>
  api.post("/payments/create-order", { orderId });

export const verifyPayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<any> =>
  api.post("/payments/verify", {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

export const confirmCODPayment = (orderId: string | number): Promise<any> =>
  api.post("/payments/cod/confirm", { orderId });

export const cancelOrder = (orderId: string | number): Promise<any> =>
  api.put(`/orders/${orderId}/cancel`);

// Shipping & Tracking
export const getShippingDetails = (orderId: string | number): Promise<any> =>
  api.get(`/shipping/orders/${orderId}/details`);

export const trackOrder = (orderId: string | number): Promise<any> =>
  api.get(`/shipping/orders/${orderId}/track`);

export const getOrderTimeline = (orderId: string | number): Promise<any> =>
  api.get(`/shipping/orders/${orderId}/timeline`);

// Addresses
export const getAddresses = (): Promise<any> => api.get("/addresses");

export const createAddress = (
  type: string,
  fullName: string,
  street: string,
  city: string,
  state: string,
  postalCode: string,
  phone: string,
): Promise<any> =>
  api.post("/addresses", {
    type,
    fullName,
    street,
    city,
    state,
    postalCode,
    phone,
  });

export const updateAddress = (
  addressId: string | number,
  data: any,
): Promise<any> => api.put(`/addresses/${addressId}`, data);

export const deleteAddress = (addressId: string | number): Promise<any> =>
  api.delete(`/addresses/${addressId}`);
