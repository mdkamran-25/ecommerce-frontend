/**
 * context/CartContext.tsx
 * Shopping cart context with TypeScript
 */

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  JSX,
} from "react";
import * as cartService from "../services/cartService";
import { AuthContext } from "./AuthContext";
import { CartItem } from "../types";

interface CartPricing {
  subtotal: number;
  discountAmount: number;
  tax: number;
  shipping: number;
  totalPrice: number;
}

interface Cart {
  items: CartItem[];
  pricing?: CartPricing;
}

interface CartContextType {
  cart: Cart | null;
  pricing: CartPricing | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  fetchCartWithPricing: () => Promise<void>;
  addToCart: (productId: string | number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string | number) => Promise<void>;
  updateCartItem: (itemId: string | number, quantity: number) => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<any>;
  removeCoupon: () => Promise<void>;
  validateStock: () => Promise<any>;
  emptyCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps): JSX.Element => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pricing, setPricing] = useState<CartPricing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const fetchCart = async (): Promise<void> => {
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

  const fetchCartWithPricing = async (): Promise<void> => {
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

  const addToCart = async (
    productId: string | number,
    quantity: number,
  ): Promise<void> => {
    try {
      await cartService.addToCart(productId, quantity);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId: string | number): Promise<void> => {
    try {
      await cartService.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (
    itemId: string | number,
    quantity: number,
  ): Promise<void> => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const applyCoupon = async (couponCode: string): Promise<any> => {
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

  const removeCoupon = async (): Promise<void> => {
    try {
      await cartService.removeCoupon();
      setPricing(null);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const validateStock = async (): Promise<any> => {
    try {
      const { data } = await cartService.validateCartStock();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const emptyCart = async (): Promise<void> => {
    try {
      await cartService.clearCart();
      setCart(null);
      setPricing(null);
    } catch (error) {
      throw error;
    }
  };

  const value: CartContextType = {
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
