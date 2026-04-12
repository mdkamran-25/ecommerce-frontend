import { createContext, useState, useEffect, useContext } from "react";
import * as cartService from "../services/cartService";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
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

  const emptyCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        updateCartItem,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
