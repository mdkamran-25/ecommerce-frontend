import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import * as orderService from "../services/orderService";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { cart, emptyCart } = useContext(CartContext);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [formData, setFormData] = useState({
    type: "SHIPPING",
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getAddresses();
        setAddresses(data.data);

        // Auto-select default address if exists
        const defaultAddr = data.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user, router]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await orderService.createAddress(
        formData.type,
        formData.fullName,
        formData.street,
        formData.city,
        formData.state,
        formData.postalCode,
        formData.phone,
      );

      // Refresh addresses
      const { data } = await orderService.getAddresses();
      setAddresses(data.data);
      setSelectedAddressId(data.data[0]?.id);
      setShowAddressForm(false);
      setFormData({
        type: "SHIPPING",
        fullName: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add address");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a shipping address");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setCreating(true);
      setError("");

      // Create order
      const { data } = await orderService.createOrder(selectedAddressId);

      // Clear cart
      await emptyCart();

      // Redirect to order details
      router.push(`/orders/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create order");
      setCreating(false);
    }
  };

  if (!user) {
    return <div className="loading">Redirecting...</div>;
  }

  if (loading) {
    return (
      <div>
        <Head>
          <title>Checkout - eCommerce Store</title>
        </Head>
        <div className="loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - eCommerce Store</title>
      </Head>

      <h1>Checkout</h1>

      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}
      >
        <div>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>Shipping Address</h2>

            {error && <div className="error">{error}</div>}

            {addresses.length === 0 ? (
              <p style={{ color: "#999", marginBottom: "1rem" }}>
                No addresses found. Add one to continue.
              </p>
            ) : (
              <div style={{ marginBottom: "1rem" }}>
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      padding: "0.5rem",
                      border:
                        selectedAddressId === addr.id
                          ? "2px solid #007bff"
                          : "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      style={{ marginRight: "0.5rem" }}
                    />
                    <span style={{ fontWeight: "bold" }}>{addr.fullName}</span>
                    <br />
                    <span style={{ fontSize: "0.9rem", color: "#666" }}>
                      {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {!showAddressForm ? (
              <button
                onClick={() => setShowAddressForm(true)}
                style={{ backgroundColor: "#6c757d" }}
              >
                + Add New Address
              </button>
            ) : (
              <form
                onSubmit={handleAddAddress}
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label>Street</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label>Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="submit"
                    disabled={creating}
                    style={{ backgroundColor: "#28a745" }}
                  >
                    {creating ? "Adding..." : "Save Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    style={{ backgroundColor: "#6c757d" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
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

          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Items: {cart?.itemCount || 0}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{cart?.totalPrice.toFixed(2) || 0}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #ddd",
              }}
            >
              <span>Shipping:</span>
              <span>₹100</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              <span>Total:</span>
              <span>₹{((cart?.totalPrice || 0) + 100).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={
              creating || !selectedAddressId || !cart || cart.items.length === 0
            }
            style={{
              width: "100%",
              backgroundColor: "#28a745",
              padding: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            {creating ? "Creating Order..." : "Create Order"}
          </button>

          <button
            onClick={() => router.push("/cart")}
            style={{
              width: "100%",
              backgroundColor: "#6c757d",
              padding: "1rem",
            }}
          >
            Back to Cart
          </button>
        </div>
      </div>
    </>
  );
}
