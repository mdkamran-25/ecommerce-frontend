import { createContext, useState, useEffect, useContext } from "react";
import * as cartService from "../services/cartService";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchCart = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartWithPricing = async () => {
    if (!user) return;
    try {
      const { data } = await cartService.getCartWithPricing();
      setCart(data.data);
      setPricing(data.data.pricing);
    } catch (error) {
      console.error("Failed to fetch cart pricing:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const addToCart = async (productId, quantity) => {
    try {
      await cartService.addToCart(productId, quantity);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      const { data } = await cartService.applyCoupon(couponCode);
      setPricing(
        data.data.pricing || {
          subtotal: data.data.subtotal,
          discountAmount: data.data.discountAmount,
          tax: 0,
          shipping: 0,
          totalPrice: 0,
        },
      );
      await fetchCart();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const removeCoupon = async () => {
    try {
      await cartService.removeCoupon();
      setPricing(null);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const validateStock = async () => {
    try {
      const { data } = await cartService.validateCartStock();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const emptyCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
      setPricing(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        pricing,
        loading,
        fetchCart,
        fetchCartWithPricing,
        addToCart,
        removeFromCart,
        updateCartItem,
        applyCoupon,
        removeCoupon,
        validateStock,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
