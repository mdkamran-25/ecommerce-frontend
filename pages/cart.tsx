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
  selectedSize?: string;
  selectedColor?: string;
  selectedCapacity?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    compareAt?: number;
    stock: number;
    images?: string[];
    sku?: string;
    description?: string;
    category?: string | { name: string };
    vendor?: string;
    weight?: number;
    dimensions?: string;
    variants?: Array<{
      id: string;
      type: string;
      value: string;
      stock: number;
    }>;
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
          {cart.items.map((item: CartItem) => {
            const sizeVariants =
              item.product?.variants?.filter((v) => v.type === "size") || [];
            const colorVariants =
              item.product?.variants?.filter((v) => v.type === "color") || [];

            return (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                  backgroundColor: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr auto",
                    gap: "1.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  {/* Product Image */}
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  )}

                  {/* Product Details */}
                  <div>
                    <h3 style={{ marginBottom: "0.5rem", marginTop: 0 }}>
                      <Link href={`/products/${item.product.id}`}>
                        {item.product.name}
                      </Link>
                    </h3>

                    {/* Category & SKU */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        marginBottom: "0.75rem",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      {item.product.category && (
                        <span>
                          <strong>Category:</strong>{" "}
                          {typeof item.product.category === "string"
                            ? item.product.category
                            : item.product.category?.name}
                        </span>
                      )}
                      {item.product.sku && (
                        <span>
                          <strong>SKU:</strong> {item.product.sku}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {item.product.description && (
                      <p
                        style={{
                          marginBottom: "0.75rem",
                          color: "#666",
                          fontSize: "0.9rem",
                          lineHeight: "1.4",
                        }}
                      >
                        {item.product.description.length > 120
                          ? item.product.description.substring(0, 120) + "..."
                          : item.product.description}
                      </p>
                    )}

                    {/* Product Details Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      {/* Price Info */}
                      <div>
                        <span style={{ color: "#666" }}>
                          <strong>Price:</strong>
                        </span>
                        <div>
                          ${item.product.price}
                          {item.product.compareAt && (
                            <span
                              style={{
                                marginLeft: "0.5rem",
                                textDecoration: "line-through",
                                color: "#999",
                              }}
                            >
                              ${item.product.compareAt}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div>
                        <span style={{ color: "#666" }}>
                          <strong>Stock:</strong>
                        </span>
                        <div
                          style={{
                            color:
                              item.product.stock > 0 ? "#28a745" : "#dc3545",
                            fontWeight: "bold",
                          }}
                        >
                          {item.product.stock > 0
                            ? `${item.product.stock} Available`
                            : "Out of Stock"}
                        </div>
                      </div>

                      {/* Vendor */}
                      {item.product.vendor && (
                        <div>
                          <span style={{ color: "#666" }}>
                            <strong>Vendor:</strong>
                          </span>
                          <div>{item.product.vendor}</div>
                        </div>
                      )}

                      {/* Weight */}
                      {item.product.weight && (
                        <div>
                          <span style={{ color: "#666" }}>
                            <strong>Weight:</strong>
                          </span>
                          <div>{item.product.weight} kg</div>
                        </div>
                      )}

                      {/* Dimensions */}
                      {item.product.dimensions && (
                        <div>
                          <span style={{ color: "#666" }}>
                            <strong>Dimensions:</strong>
                          </span>
                          <div>{item.product.dimensions}</div>
                        </div>
                      )}
                    </div>

                    {/* Variants */}
                    {(sizeVariants.length > 0 || colorVariants.length > 0) && (
                      <div
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                          marginBottom: "1rem",
                        }}
                      >
                        <p
                          style={{
                            marginTop: 0,
                            marginBottom: "0.5rem",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                          }}
                        >
                          Available Variants:
                        </p>
                        {sizeVariants.length > 0 && (
                          <div style={{ marginBottom: "0.5rem" }}>
                            <span
                              style={{ fontSize: "0.85rem", color: "#666" }}
                            >
                              <strong>Sizes:</strong>{" "}
                              {sizeVariants
                                .map((v) => `${v.value} (${v.stock} stock)`)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                        {colorVariants.length > 0 && (
                          <div>
                            <span
                              style={{ fontSize: "0.85rem", color: "#666" }}
                            >
                              <strong>Colors:</strong>{" "}
                              {colorVariants
                                .map((v) => `${v.value} (${v.stock} stock)`)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Variants */}
                    {(item.selectedSize ||
                      item.selectedColor ||
                      item.selectedCapacity) && (
                      <div
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "#e8f5e9",
                          borderRadius: "4px",
                          marginBottom: "1rem",
                          border: "1px solid #c8e6c9",
                        }}
                      >
                        <p
                          style={{
                            marginTop: 0,
                            marginBottom: "0.5rem",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                            color: "#2e7d32",
                          }}
                        >
                          ✓ Selected:
                        </p>
                        <div style={{ fontSize: "0.85rem", color: "#1b5e20" }}>
                          {item.selectedSize && (
                            <div>
                              <strong>Size:</strong> {item.selectedSize}
                            </div>
                          )}
                          {item.selectedColor && (
                            <div>
                              <strong>Color:</strong> {item.selectedColor}
                            </div>
                          )}
                          {item.selectedCapacity && (
                            <div>
                              <strong>Capacity:</strong> {item.selectedCapacity}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{
                        backgroundColor: "#dc3545",
                        padding: "0.5rem 1rem",
                        height: "fit-content",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Quantity Control */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    borderTop: "1px solid #ddd",
                    paddingTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <label style={{ fontWeight: "bold" }}>Quantity:</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(item.id, parseInt(e.target.value))
                      }
                      min="1"
                      max={item.product.stock}
                      style={{
                        width: "80px",
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    Subtotal: ${(item.quantity * item.product.price).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}

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
                  <strong>Discount:</strong> ${cartPricing.discountAmount}
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
              <span>${cartPricing.subtotal.toFixed(2)}</span>
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
                <span>-${cartPricing.discountAmount.toFixed(2)}</span>
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
              <span>${cartPricing.shipping.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax (18%):</span>
              <span>${cartPricing.tax.toFixed(2)}</span>
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
            <span>${cartPricing.totalPrice.toFixed(2)}</span>
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
