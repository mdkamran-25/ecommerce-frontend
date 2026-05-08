import { useContext, useState, useEffect, ReactNode, JSX } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
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
      <div className="min-h-screen px-4 py-8 text-slate-900 md:px-8 lg:px-12">
        <Head>
          <title>Shopping Cart - eCommerce Store</title>
        </Head>
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-semibold uppercase tracking-[0.18em] md:text-4xl">
            Shopping Cart
          </h1>
          <div className="border border-slate-200 bg-white/85 p-12 text-center shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <p className="text-slate-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8 text-slate-900 md:px-8 lg:px-12">
        <Head>
          <title>Shopping Cart - eCommerce Store</title>
        </Head>
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-semibold uppercase tracking-[0.18em] md:text-4xl">
            Shopping Cart
          </h1>
          <div className="border border-slate-200 bg-white/85 p-12 text-center shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <p className="mb-6 text-lg text-slate-600">Your cart is empty.</p>
            <Link href="/products">
              <button className="border border-slate-900 bg-slate-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
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

      <div className="min-h-screen px-4 py-8 text-slate-900 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-semibold uppercase tracking-[0.18em] md:text-4xl">
            Shopping Cart
          </h1>

          {/* Main Grid: Products Left + Order Summary Right */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
            {/* Left Column: Product Items */}
            <div className="space-y-6">
              {cart.items.map((item: CartItem) => {
                const sizeVariants =
                  item.product?.variants?.filter((v) => v.type === "size") ||
                  [];
                const colorVariants =
                  item.product?.variants?.filter((v) => v.type === "color") ||
                  [];

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 bg-white/85 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8"
                  >
                    {/* Product Header: Image, Details, Remove Button */}
                    <div className="grid gap-6 md:grid-cols-[140px_1fr_auto] mb-6">
                      {/* Product Image */}
                      {item.product.images?.[0] && (
                        <div className="overflow-hidden bg-white border border-slate-200 relative w-full h-40">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            sizes="(max-width: 640px) 100px, 140px"
                            className="object-cover"
                            priority={false}
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="mb-3 text-lg font-semibold">
                            <Link href={`/products/${item.product.id}`}>
                              {item.product.name}
                            </Link>
                          </h3>

                          {/* Category & SKU */}
                          <div className="mb-4 space-y-1 text-xs text-slate-600">
                            {item.product.category && (
                              <p>
                                <span className="font-medium text-slate-900">
                                  Category:
                                </span>{" "}
                                {typeof item.product.category === "string"
                                  ? item.product.category
                                  : item.product.category?.name}
                              </p>
                            )}
                            {item.product.sku && (
                              <p>
                                <span className="font-medium text-slate-900">
                                  SKU:
                                </span>{" "}
                                {item.product.sku}
                              </p>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-lg font-semibold text-slate-900">
                              ${item.product.price}
                            </p>
                            {item.product.compareAt && (
                              <p className="text-sm line-through text-slate-400">
                                ${item.product.compareAt}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {item.product.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {item.product.description}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <div className="flex flex-col h-full gap-2">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.22em] transition text-slate-600 hover:border-slate-900 hover:text-slate-900"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Variants Info */}
                    {(sizeVariants.length > 0 || colorVariants.length > 0) && (
                      <div className="pt-4 mb-4 space-y-2 border-t border-slate-200">
                        {sizeVariants.length > 0 && (
                          <p className="text-xs text-slate-600">
                            <span className="font-medium text-slate-900">
                              Sizes:
                            </span>{" "}
                            {sizeVariants
                              .map((v) => `${v.value} (${v.stock})`)
                              .join(", ")}
                          </p>
                        )}
                        {colorVariants.length > 0 && (
                          <p className="text-xs text-slate-600">
                            <span className="font-medium text-slate-900">
                              Colors:
                            </span>{" "}
                            {colorVariants
                              .map((v) => `${v.value} (${v.stock})`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Selected Variants */}
                    {(item.selectedSize ||
                      item.selectedColor ||
                      item.selectedCapacity) && (
                      <div className="px-4 py-3 mb-4 space-y-1 border-l-4 border-green-500 bg-green-50">
                        <p className="text-xs font-medium uppercase tracking-[0.22em] text-green-900">
                          Selected
                        </p>
                        <div className="text-xs text-green-800">
                          {item.selectedSize && (
                            <p>
                              <span className="font-medium">Size:</span>{" "}
                              {item.selectedSize}
                            </p>
                          )}
                          {item.selectedColor && (
                            <p>
                              <span className="font-medium">Color:</span>{" "}
                              {item.selectedColor}
                            </p>
                          )}
                          {item.selectedCapacity && (
                            <p>
                              <span className="font-medium">Capacity:</span>{" "}
                              {item.selectedCapacity}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quantity & Subtotal */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-3">
                        <label className="text-xs uppercase tracking-[0.28em] text-slate-500">
                          Qty:
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.id,
                              parseInt(e.target.value),
                            )
                          }
                          min="1"
                          max={item.product.stock}
                          className="w-16 px-3 py-2 text-sm transition bg-white border outline-none border-slate-300 focus:border-slate-900"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-[0.22em] mb-1">
                          Subtotal
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          ${(item.quantity * item.product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <aside className="lg:sticky lg:top-8 h-fit">
              <div className="border border-slate-200 bg-white/85 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8">
                <h2 className="mb-6 text-2xl font-semibold uppercase tracking-[0.18em]">
                  Order Summary
                </h2>

                <div className="pb-6 space-y-4 border-b border-slate-200">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-900">
                      ${cartPricing.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {cartPricing.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">
                        -${cartPricing.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping:</span>
                    <span className="font-medium text-slate-900">
                      ${cartPricing.shipping.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax (18%):</span>
                    <span className="font-medium text-slate-900">
                      ${cartPricing.tax.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 pb-6 mb-6 border-b border-slate-200">
                  <span className="text-lg font-semibold uppercase tracking-[0.22em]">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    ${cartPricing.totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  <Link href="/checkout">
                    <button className="w-full border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800">
                      Proceed to Checkout
                    </button>
                  </Link>

                  <Link href="/products">
                    <button className="w-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-900 transition hover:border-slate-900">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Coupon Section - Full Width Bottom */}
          <div className="border border-slate-200 bg-white/85 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8 mt-8">
            <h3 className="mb-4 text-lg font-semibold uppercase tracking-[0.18em]">
              Apply Coupon Code
            </h3>

            {couponError && (
              <div className="px-4 py-3 mb-4 text-xs text-red-700 border border-red-200 bg-red-50">
                {couponError}
              </div>
            )}

            {couponSuccess && (
              <div className="px-4 py-3 mb-4 text-xs text-green-700 border border-green-200 bg-green-50">
                ✓ {couponSuccess}
              </div>
            )}

            {appliedCoupon ? (
              <div className="p-4 mb-4 space-y-3 border border-blue-200 bg-blue-50">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Applied Coupon
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {appliedCoupon}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium text-slate-900">
                      Discount:
                    </span>{" "}
                    ${cartPricing.discountAmount}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="border border-slate-900 bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-slate-800"
                >
                  Remove Coupon
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm transition bg-white border outline-none border-slate-300 focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="border border-slate-900 bg-slate-900 px-6 py-2 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {applyingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
              </form>
            )}
          </div>
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
