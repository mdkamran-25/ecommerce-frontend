import { useEffect, useState, useContext, JSX } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import * as orderService from "../../services/orderService";
import ProtectedRoute from "../../components/ProtectedRoute";
import { AuthContext } from "../../context/AuthContext";

/**
 * OrdersListPage
 * Displays all orders for the current user
 */

interface OrderItem {
  id: string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  createdAt: string;
  finalPrice: number;
  items: OrderItem[];
}

interface AuthContextType {
  user: any;
}

/**
 * OrdersListPageContent Component
 * Inner component for orders list (used with ProtectedRoute wrapper)
 */
function OrdersListPageContent(): JSX.Element {
  const router = useRouter();
  const { user } = useContext(AuthContext) as AuthContextType;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetch orders on mount
   */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getOrders();
        setOrders(data.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (!user) {
    return <div className="loading">Redirecting...</div>;
  }

  if (loading) {
    return (
      <div>
        <Head>
          <title>My Orders - eCommerce Store</title>
        </Head>
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders - eCommerce Store</title>
      </Head>

      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p>You haven't placed any orders yet.</p>
          <Link href="/products">
            <button style={{ marginTop: "1rem" }}>Start Shopping</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1.5rem",
                backgroundColor: "#fff",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>
                    Order Number
                  </p>
                  <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {order.orderNumber}
                  </p>
                </div>

                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>Status</p>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color:
                        order.orderStatus === "DELIVERED"
                          ? "#28a745"
                          : "#007bff",
                    }}
                  >
                    {order.orderStatus}
                  </p>
                </div>

                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>Total</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    ${order.finalPrice.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>Date</p>
                  <p style={{ fontSize: "0.95rem" }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                }}
              >
                {order.items.length} item(s)
              </p>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/orders/${order.id}`}>
                  <button style={{ backgroundColor: "#007bff" }}>
                    View Details
                  </button>
                </Link>
                {(order.orderStatus === "CONFIRMED" ||
                  order.orderStatus === "PROCESSING" ||
                  order.orderStatus === "SHIPPED" ||
                  order.orderStatus === "DELIVERED") && (
                  <Link href={`/orders/${order.id}/tracking`}>
                    <button style={{ backgroundColor: "#28a745" }}>
                      Track Order
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Orders List Page with Protected Route
 */
const OrdersListPage = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <OrdersListPageContent />
    </ProtectedRoute>
  );
};

export default OrdersListPage;
