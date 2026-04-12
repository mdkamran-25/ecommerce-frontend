import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "next/router";
import * as orderService from "../../services/orderService";

export default function OrdersListPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

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
                    ₹{order.finalPrice.toFixed(2)}
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

              <Link href={`/orders/${order.id}`}>
                <button style={{ backgroundColor: "#007bff" }}>
                  View Details
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
