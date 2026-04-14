import { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { CartContext } from "../context/CartContext";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import { toast } from "react-toastify";

function CartPageContent() {
  const router = useRouter();
  const {
    cart,
    loading,
    removeFromCart,
    updateCartItem,
    applyCoupon,
    removeCoupon,
    pricing,
  } = useContext(CartContext);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Calculate dynamic pricing
  const calculatePricing = () => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
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
      total: parseFloat(total.toFixed(2)),
    };
  };

  const cartPricing = calculatePricing();

  const handleApplyCoupon = async (e) => {
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
    } catch (error) {
      setCouponError(error.response?.data?.error || "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
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

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(
        "Failed to remove item: " +
          (error.response?.data?.error || "Unknown error"),
      );
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
      toast.success("Quantity updated");
    } catch (error) {
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
          {cart.items.map((item) => (
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
                  style={{
                    backgroundColor: "#dc3545",
                    padding: "0.5rem 1rem",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove Coupon
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleApplyCoupon}
                style={{ display: "flex", gap: "0.5rem" }}
              >
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
                <button
                  type="submit"
                  disabled={applyingCoupon}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: applyingCoupon ? "not-allowed" : "pointer",
                  }}
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </form>
            )}

            <p
              style={{ fontSize: "0.85rem", color: "#666", marginTop: "1rem" }}
            >
              💡 Try: SAVE10, SAVE20, FLAT50, FLAT100, WELCOME5, FREESHIP
            </p>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            height: "fit-content",
            backgroundColor: "#f9f9f9",
            position: "sticky",
            top: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Order Summary</h2>

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
                marginBottom: "0.75rem",
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
                  marginBottom: "0.75rem",
                  color: "#28a745",
                  fontWeight: "bold",
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
                marginBottom: "0.75rem",
              }}
            >
              <span>Tax (18% GST):</span>
              <span>₹{cartPricing.tax.toFixed(2)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <span>
                Shipping:
                {cartPricing.shipping === 0 && (
                  <span style={{ color: "#28a745", fontSize: "0.85rem" }}>
                    {" "}
                    (Free!)
                  </span>
                )}
              </span>
              <span>
                {cartPricing.shipping === 0
                  ? "FREE"
                  : `₹${cartPricing.shipping}`}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#28a745",
            }}
          >
            <span>Total:</span>
            <span>₹{cartPricing.total.toFixed(2)}</span>
          </div>

          {cartPricing.shipping === 0 && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#d4edda",
                color: "#155724",
                borderRadius: "4px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              🎉 You got FREE SHIPPING!
            </div>
          )}

          <Link href="/checkout" style={{ display: "block" }}>
            <button
              style={{
                width: "100%",
                backgroundColor: "#28a745",
                padding: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              Proceed to Checkout
            </button>
          </Link>

          <Link href="/products">
            <button
              style={{
                width: "100%",
                backgroundColor: "#6c757d",
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

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  );
}
