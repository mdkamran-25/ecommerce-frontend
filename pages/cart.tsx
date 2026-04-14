import { useContext, useState, useEffect, ReactNode, JSX } from "react";
import Head from "next/head";
import Link from "next/link";
import { CartContext } from "../context/CartContext";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import { toast } from "react-toastify";

/**
 * CartPage
 * Displays shopping cart with items, quantities, coupons, and checkout
 */

interface CartItem {
  id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images?: string[];
  };
}

interface Cart {
  items: CartItem[];
  discountAmount?: number;
  couponCode?: string;
}

interface PricingInfo {
  subtotal: number;
  discountAmount: number;
  shipping: number;
  tax: number;
  totalPrice: number;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  pricing?: PricingInfo;
}

/**
 * CartPageContent Component
 * Inner component for cart content (used with ProtectedRoute wrapper)
 */
interface CartPageContentProps {
  // No props needed
}

function CartPageContent(_props: CartPageContentProps): JSX.Element {
  const router = useRouter();
  const {
    cart,
    loading,
    removeFromCart,
    updateCartItem,
    applyCoupon,
    removeCoupon,
  } = useContext(CartContext) as CartContextType;

  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);

  /**
   * Calculate dynamic pricing based on cart contents
   */
  const calculatePricing = (): PricingInfo => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        shipping: 0,
        tax: 0,
        totalPrice: 0,
      };
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    const discountAmount = cart.discountAmount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;

    // Dynamic shipping calculation
    let shipping = 100;
    if (subtotalAfterDiscount >= 2000) shipping = 0;
    else if (subtotalAfterDiscount >= 1000) shipping = 50;
    else if (subtotalAfterDiscount >= 500) shipping = 75;

    // Tax calculation (18% GST)
    const tax = parseFloat((subtotalAfterDiscount * 0.18).toFixed(2));
    const total = subtotalAfterDiscount + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      shipping,
      tax,
      totalPrice: parseFloat(total.toFixed(2)),
    };
  };

  const cartPricing = calculatePricing();

  /**
   * Handle coupon application
   */
  const handleApplyCoupon = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponError("");
      setCouponSuccess("");

      await applyCoupon(couponCode);
      setCouponSuccess("Coupon applied successfully!");
      setAppliedCoupon(couponCode);
      setCouponCode("");
    } catch (error: any) {
      setCouponError(error.response?.data?.error || "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  /**
   * Handle coupon removal
   */
  const handleRemoveCoupon = async (): Promise<void> => {
    try {
      await removeCoupon();
      setAppliedCoupon("");
      setCouponCode("");
      setCouponError("");
      setCouponSuccess("");
    } catch (error) {
      setCouponError("Failed to remove coupon");
    }
  };

  if (loading) {
    return (
      <div>
        <Head>
          <title>Shopping Cart - eCommerce Store</title>
        </Head>
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <Head>
          <title>Shopping Cart - eCommerce Store</title>
        </Head>
        <h1>Shopping Cart</h1>
        <p style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
          Your cart is empty.
        </p>
        <Link href="/products">
          <button style={{ display: "block", margin: "1rem auto" }}>
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  /**
   * Handle item removal from cart
   */
  const handleRemove = async (itemId: string): Promise<void> => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(
        "Failed to remove item: " +
          (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  /**
   * Handle quantity update
   */
  const handleUpdateQuantity = async (
    itemId: string,
    newQuantity: number,
  ): Promise<void> => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
      toast.success("Quantity updated");
    } catch (error: any) {
      toast.error(
        "Failed to update quantity: " +
          (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  return (
    <>
      <Head>
        <title>Shopping Cart - eCommerce Store</title>
      </Head>

      <h1>Shopping Cart</h1>

      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}
      >
        <div>
          {cart.items.map((item: CartItem) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                display: "grid",
                gridTemplateColumns: "100px 1fr auto",
                gap: "1rem",
                alignItems: "start",
              }}
            >
              {item.product.images?.[0] && (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              )}

              <div>
                <h3 style={{ marginBottom: "0.5rem" }}>
                  <Link href={`/products/${item.product.id}`}>
                    {item.product.name}
                  </Link>
                </h3>
                <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                  Price: ₹{item.product.price}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <label>Qty:</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateQuantity(item.id, parseInt(e.target.value))
                    }
                    min="1"
                    max={item.product.stock}
                    style={{ width: "70px" }}
                  />
                  <span style={{ fontSize: "0.9rem", color: "#999" }}>
                    Stock: {item.product.stock}
                  </span>
                </div>

                <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                  Subtotal: ₹{(item.quantity * item.product.price).toFixed(2)}
                </p>
              </div>

              <div>
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{ backgroundColor: "#dc3545", width: "100px" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Coupon Section */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
              marginTop: "1.5rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Apply Coupon Code</h3>

            {couponError && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                {couponError}
              </div>
            )}

            {couponSuccess && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                ✅ {couponSuccess}
              </div>
            )}

            {appliedCoupon ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#e7f3ff",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Applied Coupon:</strong> {appliedCoupon}
                </p>
                <p style={{ marginBottom: "1rem", color: "#666" }}>
                  <strong>Discount:</strong> ₹{cartPricing.discountAmount}
                </p>
                <button
                  onClick={handleRemoveCoupon}
                  style={{ backgroundColor: "#dc3545" }}
                >
                  Remove Coupon
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    style={{ backgroundColor: "#28a745" }}
                  >
                    {applyingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            height: "fit-content",
            position: "sticky",
            top: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>Order Summary</h2>

          <div
            style={{
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{cartPricing.subtotal.toFixed(2)}</span>
            </div>

            {cartPricing.discountAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  color: "#28a745",
                }}
              >
                <span>Discount:</span>
                <span>-₹{cartPricing.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Shipping:</span>
              <span>₹{cartPricing.shipping.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax (18%):</span>
              <span>₹{cartPricing.tax.toFixed(2)}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.2rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
            }}
          >
            <span>Total:</span>
            <span>₹{cartPricing.totalPrice.toFixed(2)}</span>
          </div>

          <Link href="/checkout">
            <button style={{ width: "100%", backgroundColor: "#007bff" }}>
              Proceed to Checkout
            </button>
          </Link>

          <Link href="/products">
            <button
              style={{
                width: "100%",
                marginTop: "0.5rem",
                backgroundColor: "#f0f0f0",
                color: "#333",
              }}
            >
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

/**
 * Cart Page with Protected Route
 */
const CartPage = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  );
};

export default CartPage;
