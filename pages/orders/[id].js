import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import * as orderService from "../../services/orderService";
import ProtectedRoute from "../../components/ProtectedRoute";

const OrderStatusBadge = ({ status }) => {
  const statusColors = {
    PENDING: "#ffc107",
    CONFIRMED: "#17a2b8",
    PROCESSING: "#007bff",
    SHIPPED: "#0c63e4",
    DELIVERED: "#28a745",
    CANCELLED: "#dc3545",
    RETURNED: "#6c757d",
  };

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: statusColors[status] || "#6c757d",
        color: "#fff",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        fontSize: "0.85rem",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
  );
};

function OrderDetailPageContent() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getOrder(id);
        setOrder(data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load order");
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Head>
          <title>Order Details - eCommerce Store</title>
        </Head>
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Head>
          <title>Order Details - eCommerce Store</title>
        </Head>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: "1rem", backgroundColor: "#6c757d" }}
        >
          ← Back
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Head>
          <title>Order Details - eCommerce Store</title>
        </Head>
        <div className="error">Order not found</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{order.orderNumber} - eCommerce Store</title>
      </Head>

      <button
        onClick={() => router.back()}
        style={{ marginBottom: "1rem", backgroundColor: "#6c757d" }}
      >
        ← Back
      </button>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Header Section */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "2rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  color: "#999",
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem",
                }}
              >
                Order Number
              </p>
              <p style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                {order.orderNumber}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: "#999",
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem",
                }}
              >
                Order Date
              </p>
              <p style={{ fontSize: "1.1rem" }}>
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: "#999",
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem",
                }}
              >
                Order Status
              </p>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
          </div>

          {order.orderStatus === "PENDING" && (
            <p style={{ color: "#dc3545", fontSize: "0.9rem" }}>
              ⚠️ Your order has not been confirmed yet. Please complete the
              payment.
            </p>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Items Section */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>Order Items</h2>

            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr auto",
                  gap: "1rem",
                  paddingBottom: "1rem",
                  marginBottom: "1rem",
                  borderBottom: "1px solid #eee",
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
                  <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                    <Link href={`/products/${item.product.id}`}>
                      {item.product.name}
                    </Link>
                  </p>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Qty: {item.quantity}
                  </p>
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Price: ₹{item.price} each
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
              height: "fit-content",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Order Summary</h3>

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
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    color: "#28a745",
                  }}
                >
                  <span>Discount:</span>
                  <span>-₹{order.discountAmount.toFixed(2)}</span>
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
                <span>₹{order.shippingCost.toFixed(2)}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              <span>Total:</span>
              <span>₹{order.finalPrice.toFixed(2)}</span>
            </div>

            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fff",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "0.25rem",
                }}
              >
                Payment Status
              </p>
              <OrderStatusBadge status={order.paymentStatus} />
            </div>

            {order.orderStatus === "PENDING" &&
              order.paymentStatus === "PENDING" && (
                <button
                  style={{
                    width: "100%",
                    backgroundColor: "#28a745",
                    padding: "0.75rem",
                  }}
                >
                  Proceed to Payment
                </button>
              )}
          </div>
        </div>

        {/* Shipping Address */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Shipping Address</h2>

          {order.shippingAddress && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              <div>
                <p style={{ color: "#999", fontSize: "0.9rem" }}>
                  Recipient Name
                </p>
                <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                  {order.shippingAddress.fullName}
                </p>

                <p style={{ color: "#999", fontSize: "0.9rem" }}>Address</p>
                <p style={{ marginBottom: "1rem" }}>
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </p>

                <p style={{ color: "#999", fontSize: "0.9rem" }}>Phone</p>
                <p>{order.shippingAddress.phone}</p>
              </div>

              <div>
                {order.shippedAt && (
                  <div>
                    <p style={{ color: "#999", fontSize: "0.9rem" }}>
                      Shipped Date
                    </p>
                    <p style={{ marginBottom: "1rem" }}>
                      {new Date(order.shippedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {order.deliveredAt && (
                  <div>
                    <p style={{ color: "#999", fontSize: "0.9rem" }}>
                      Delivered Date
                    </p>
                    <p>{new Date(order.deliveredAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailPageContent />
    </ProtectedRoute>
  );
}
