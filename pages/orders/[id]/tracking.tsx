/**
 * Order Tracking Page
 * Displays order tracking status, timeline, and shipping details
 */

import { useState, useEffect, useContext, FC } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AuthContext } from "../../../context/AuthContext";
import * as orderService from "../../../services/orderService";
import { toast } from "react-toastify";

/**
 * Timeline event interface
 */
interface TimelineEvent {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
}

/**
 * Shipping address interface
 */
interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

/**
 * Order interface
 */
interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  shippingAddress?: ShippingAddress;
}

/**
 * OrderTrackingPage - Displays order tracking information
 */
const OrderTrackingPage: FC = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext) as any;
  const { id: orderId } = router.query as { id?: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch order details
   */
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        const { data: orderData } = await (orderService as any).getOrder(
          orderId,
        );
        setOrder(orderData.data);

        try {
          const { data: timelineData } = await (
            orderService as any
          ).getOrderTimeline(orderId);
          setTimeline(timelineData.data.events);
        } catch (err) {
          console.log("Timeline not available");
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  /**
   * Get status color based on order status
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "DELIVERED":
        return "#28a745";
      case "SHIPPED":
        return "#007bff";
      case "PROCESSING":
        return "#ffc107";
      case "CONFIRMED":
        return "#17a2b8";
      case "PENDING":
        return "#6c757d";
      default:
        return "#495057";
    }
  };

  /**
   * Get status badge with emoji
   */
  const getStatusBadge = (status: string): { label: string; icon: string } => {
    const statusMap: { [key: string]: { label: string; icon: string } } = {
      PENDING: { label: "Pending", icon: "⏳" },
      CONFIRMED: { label: "Confirmed", icon: "✅" },
      PROCESSING: { label: "Processing", icon: "⚙️" },
      SHIPPED: { label: "Shipped", icon: "🚚" },
      DELIVERED: { label: "Delivered", icon: "🎉" },
      CANCELLED: { label: "Cancelled", icon: "❌" },
    };
    return statusMap[status] || { label: status, icon: "📦" };
  };

  if (loading) {
    return (
      <div>
        <Head>
          <title>Order Tracking</title>
        </Head>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Head>
          <title>Order Not Found</title>
        </Head>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#dc3545" }}>Order not found</h2>
          <button
            onClick={() => router.push("/orders")}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusBadge = getStatusBadge(order.orderStatus);

  return (
    <>
      <Head>
        <title>Order Tracking - {order.orderNumber}</title>
      </Head>

      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "2rem",
            textAlign: "center",
            borderBottom: "2px solid #eee",
            paddingBottom: "1.5rem",
          }}
        >
          <h1 style={{ margin: "0 0 0.5rem 0" }}>Order Tracking</h1>
          <p style={{ margin: "0", color: "#666", fontSize: "0.95rem" }}>
            Order Number: <strong>{order.orderNumber}</strong>
          </p>
          <p
            style={{
              margin: "0.3rem 0 0 0",
              color: "#999",
              fontSize: "0.85rem",
            }}
          >
            Ordered on {orderDate}
          </p>
        </div>

        {/* Order Status Card */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
            {statusBadge.icon}
          </div>
          <h2
            style={{
              margin: "0",
              color: getStatusColor(order.orderStatus),
              fontSize: "1.8rem",
            }}
          >
            {statusBadge.label}
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#666" }}>
            Last updated {new Date(order.updatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Tracking Information */}
        {(order.trackingNumber || order.carrierName) && (
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
              Tracking Information
            </h3>

            {order.carrierName && (
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: "0.9rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Courier
                </label>
                <p
                  style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}
                >
                  {order.carrierName}
                </p>
              </div>
            )}

            {order.trackingNumber && (
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: "0.9rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Tracking Number
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.2rem",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "#007bff",
                    backgroundColor: "#f0f8ff",
                    padding: "0.75rem",
                    borderRadius: "4px",
                  }}
                >
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {order.estimatedDeliveryDate && (
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: "0.9rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Estimated Delivery
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#28a745",
                  }}
                >
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Order Timeline</h3>

            <div style={{ position: "relative" }}>
              {timeline.map((event, index) => (
                <div
                  key={index}
                  style={{ display: "flex", marginBottom: "1.5rem" }}
                >
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "40px",
                        width: "2px",
                        height: "60px",
                        backgroundColor: "#ddd",
                      }}
                    />
                  )}

                  {/* Timeline dot */}
                  <div
                    style={{
                      width: "30px",
                      minWidth: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#007bff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.9rem",
                      marginRight: "1rem",
                      zIndex: 1,
                      position: "relative",
                    }}
                  >
                    {event.icon}
                  </div>

                  {/* Event details */}
                  <div style={{ flex: 1, paddingTop: "0.25rem" }}>
                    <h4 style={{ margin: "0 0 0.25rem 0" }}>{event.title}</h4>
                    <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                      {event.description}
                    </p>
                    <p
                      style={{
                        margin: "0.5rem 0 0 0",
                        color: "#999",
                        fontSize: "0.8rem",
                      }}
                    >
                      {new Date(event.timestamp).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      } as any)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
              Shipping Address
            </h3>
            <p style={{ margin: "0.3rem 0" }}>
              <strong>{order.shippingAddress.fullName}</strong>
            </p>
            <p style={{ margin: "0.3rem 0" }}>{order.shippingAddress.street}</p>
            <p style={{ margin: "0.3rem 0" }}>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p style={{ margin: "0.3rem 0" }}>
              Phone: {order.shippingAddress.phone}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTrackingPage;
