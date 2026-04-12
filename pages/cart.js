import { useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { CartContext } from "../context/CartContext";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";

function CartPageContent() {
  const router = useRouter();
  const { cart, loading, removeFromCart, updateCartItem } =
    useContext(CartContext);

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
    } catch (error) {
      alert("Failed to remove item: " + error.response?.data?.error);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      alert("Failed to update quantity: " + error.response?.data?.error);
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
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            height: "fit-content",
            backgroundColor: "#f9f9f9",
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
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{cart.totalPrice.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Shipping:</span>
              <span>₹100</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            <span>Total:</span>
            <span>₹{(cart.totalPrice + 100).toFixed(2)}</span>
          </div>

          <Link href="/checkout" style={{ display: "block" }}>
            <button
              style={{
                width: "100%",
                backgroundColor: "#28a745",
                padding: "1rem",
              }}
            >
              Proceed to Checkout
            </button>
          </Link>

          <Link href="/products">
            <button
              style={{
                width: "100%",
                marginTop: "0.5rem",
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
