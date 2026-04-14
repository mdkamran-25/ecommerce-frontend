import { useState, useContext, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { CartContext } from "../context/CartContext";
import * as orderService from "../services/orderService";
import ProtectedRoute from "../components/ProtectedRoute";

/**
 * CheckoutPage
 * Handles order checkout with address selection and payment processing
 */

interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  type: string;
  isDefault?: boolean;
}

interface FormData {
  type: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

interface CartContextType {
  cart: any;
  emptyCart: () => Promise<void>;
  validateStock: () => Promise<void>;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * CheckoutPageContent Component
 * Inner component for checkout (used with ProtectedRoute wrapper)
 */
function CheckoutPageContent(): JSX.Element {
  const router = useRouter();
  const { cart, emptyCart, validateStock } = useContext(
    CartContext,
  ) as CartContextType;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    type: "SHIPPING",
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });

  /**
   * Fetch addresses on mount
   */
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getAddresses();
        setAddresses(data.data);

        // Auto-select default address if exists
        const defaultAddr = data.data.find((a: Address) => a.isDefault);
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
  }, [router]);

  /**
   * Handle adding a new address
   */
  const handleAddAddress = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
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
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add address");
    } finally {
      setCreating(false);
    }
  };

  /**
   * Calculate estimated delivery date
   */
  const calculateEstimatedDelivery = (): string => {
    const today = new Date();
    // Standard delivery: 5-7 business days
    const minDays = 5;
    const maxDays = 7;

    const minDate = new Date(today);
    const maxDate = new Date(today);

    minDate.setDate(minDate.getDate() + minDays);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${minDate.toLocaleDateString("en-US", options)} - ${maxDate.toLocaleDateString("en-US", options)}`;
  };

  /**
   * Handle order creation and payment
   */
  const handleCreateOrder = async (): Promise<void> => {
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

      // Step 0: Validate stock availability
      try {
        await validateStock();
      } catch (validationErr: any) {
        if (validationErr.response?.data?.invalidItems) {
          const items = validationErr.response.data.invalidItems;
          const itemsList = items
            .map(
              (item: any) =>
                `${item.productName} (requested: ${item.requestedQuantity}, available: ${item.availableStock})`,
            )
            .join("\n");
          setError(
            `Stock validation failed:\n${itemsList}\n\nPlease update your cart quantities.`,
          );
        } else {
          setError(
            validationErr.response?.data?.error ||
              "Stock validation failed. Please check your cart.",
          );
        }
        setCreating(false);
        return;
      }

      // Step 1: Create order
      const { data } = await orderService.createOrder(
        selectedAddressId,
        cart.discountAmount || 0,
        cart.couponCode || "",
      );
      const orderId = data.data.id;
      const finalPrice = data.data.finalPrice;

      // Step 2: Create Razorpay order
      const paymentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            orderId,
            amount: finalPrice,
          }),
        },
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const paymentData = await paymentResponse.json();
      const razorpayOrderId = paymentData.data.id;

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: Math.round(finalPrice * 100), // Amount in paise
        currency: "INR",
        name: "eCommerce Store",
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Step 4: Verify payment on backend
            console.log("[CHECKOUT] Razorpay response received:", response);
            const verifyPayload = {
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            console.log(
              "[CHECKOUT] Sending payment verification:",
              verifyPayload,
            );

            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(verifyPayload),
              },
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              console.error("[CHECKOUT] Verification failed:", {
                status: verifyResponse.status,
                data: verifyData,
              });
              throw new Error(
                verifyData.error || "Payment verification failed",
              );
            }

            console.log("[CHECKOUT] ✅ Payment verified successfully");

            // Payment successful
            await emptyCart();
            router.push(`/orders/${orderId}`);
          } catch (err) {
            setError(
              "Payment verification failed. Order may still be pending.",
            );
            console.error("Verification error:", err);
          } finally {
            setCreating(false);
          }
        },
        prefill: {
          email: "", // User email if available
          contact: "", // User phone if available
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setCreating(false);
            setError("Payment cancelled. Your order is pending.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      setCreating(false);
    }
  };

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

            {error && (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

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

          {/* Order Summary Items */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>Order Items</h2>
            {cart?.items?.map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>₹{(item.quantity * item.product.price).toFixed(2)}</span>
              </div>
            ))}

            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "2px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <strong>Estimated Delivery:</strong>
              <strong>{calculateEstimatedDelivery()}</strong>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
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
          <h2 style={{ marginBottom: "1rem" }}>Order Total</h2>

          <div style={{ marginBottom: "1rem", paddingBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{cart?.subtotal?.toFixed(2) || "0.00"}</span>
            </div>

            {cart?.discountAmount && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  color: "#28a745",
                }}
              >
                <span>Discount:</span>
                <span>-₹{cart.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Tax:</span>
              <span>₹{cart?.tax?.toFixed(2) || "0.00"}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Shipping:</span>
              <span>₹{cart?.shipping?.toFixed(2) || "0.00"}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.3rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              paddingTop: "1rem",
              borderTop: "2px solid #ddd",
            }}
          >
            <span>Total:</span>
            <span>₹{cart?.totalPrice?.toFixed(2) || "0.00"}</span>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={creating || !selectedAddressId}
            style={{
              width: "100%",
              backgroundColor: !selectedAddressId ? "#ccc" : "#28a745",
              padding: "1rem",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: !selectedAddressId ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            {creating ? "Processing..." : "Complete Purchase"}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Checkout Page with Protected Route
 */
const CheckoutPage = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
};

export default CheckoutPage;
