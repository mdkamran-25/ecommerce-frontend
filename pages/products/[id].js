import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import * as productService from "../../services/productService";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await productService.getProduct(id);
        setProduct(data.data);
      } catch (error) {
        setError("Failed to load product details");
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      setError("Invalid quantity");
      return;
    }

    try {
      setAdding(true);
      setError("");
      await addToCart(product.id, quantity);
      alert("✅ Added " + quantity + " item(s) to cart!");
      setQuantity(1);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="error">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - eCommerce Store</title>
        <meta name="description" content={product.description} />
      </Head>

      <button
        onClick={() => router.back()}
        style={{ marginBottom: "1rem", backgroundColor: "#6c757d" }}
      >
        ← Back
      </button>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        <div>
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "400px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              No image available
            </div>
          )}

          {product.images?.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name}-${idx}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1>{product.name}</h1>

          {product.compareAt && (
            <p
              style={{
                color: "#999",
                textDecoration: "line-through",
                marginBottom: "0.5rem",
              }}
            >
              ₹{product.compareAt}
            </p>
          )}

          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#28a745",
              marginBottom: "1rem",
            }}
          >
            ₹{product.price}
          </p>

          <p style={{ marginBottom: "1rem", color: "#666" }}>
            <strong>Stock:</strong> {product.stock} items available
          </p>

          {product.category && (
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              <strong>Category:</strong> {product.category.name}
            </p>
          )}

          {product.sku && (
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              <strong>SKU:</strong> {product.sku}
            </p>
          )}

          <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            Description
          </h3>
          <p
            style={{ color: "#666", lineHeight: "1.6", marginBottom: "1.5rem" }}
          >
            {product.description}
          </p>

          {error && <div className="error">{error}</div>}

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Quantity:
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                max={product.stock}
                style={{ width: "100px" }}
              />
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1.1rem",
              backgroundColor: product.stock === 0 ? "#ccc" : "#28a745",
            }}
          >
            {adding
              ? "Adding to cart..."
              : product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
          </button>

          {product.variants?.length > 0 && (
            <>
              <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                Variants
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "0.9rem" }}>{variant.type}</p>
                    <p style={{ fontWeight: "bold" }}>{variant.value}</p>
                    <p style={{ fontSize: "0.85rem", color: "#666" }}>
                      Stock: {variant.stock}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
