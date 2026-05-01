import { useState, useContext, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { CartContext } from "../context/CartContext";
import * as orderService from "../services/orderService";
import ProtectedRoute from "../components/ProtectedRoute";
import { toast } from "react-toastify";

/**
 * CheckoutPage
 * Modern checkout with tab-based navigation and order summary
 */

interface CartItem {
  id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images?: string[];
  };
}

type TabType = "information" | "shipping" | "payment";

function CheckoutPageContent(): JSX.Element {
  const router = useRouter();
  const { cart } = useContext(CartContext) as any;
  const [activeTab, setActiveTab] = useState<TabType>("information");
  const [loading, setLoading] = useState(false);

  // Form Data States
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");

  // Redirect if no cart items
  useEffect(() => {
    if (cart?.items?.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  const handleContinueShopping = () => {
    router.push("/products");
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      // This would call removeFromCart from CartContext
      toast.info("Item functionality coming soon");
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      // Validate form
      if (
        !email ||
        !phone ||
        !firstName ||
        !lastName ||
        !address ||
        !city ||
        !postalCode
      ) {
        setError("Please fill in all fields");
        setActiveTab("information");
        return;
      }

      // TODO: Create order and process payment
      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) =>
      sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + shippingCost;

  return (
    <>
      <Head>
        <title>Checkout - eCommerce Store</title>
      </Head>
      {/* dont use background color white or anything */}
      <div className="min-h-screen ">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 md:px-8 md:py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold md:text-3xl">CHECKOUT</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 px-4 -mx-4 border-b border-gray-200 md:-mx-8 md:px-8">
            {[
              { id: "information", label: "INFORMATION" },
              { id: "shipping", label: "SHIPPING" },
              { id: "payment", label: "PAYMENT" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 font-medium text-sm transition border-b-2 ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8 p-4 mx-auto lg:grid lg:grid-cols-3 md:p-8 max-w-7xl">
          {/* Left Section - Forms */}
          <div className="lg:col-span-2">
            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 border border-red-200 rounded ">
                {error}
              </div>
            )}

            {/* INFORMATION TAB */}
            {activeTab === "information" && (
              <div>
                <h2 className="mb-6 text-lg font-bold">CONTACT INFO</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <h2 className="mt-8 mb-6 text-lg font-bold">
                  SHIPPING ADDRESS
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="State / Region"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("shipping")}
                  className="flex items-center gap-2 px-6 py-3 mt-8 font-medium text-gray-800 transition bg-gray-300 hover:bg-gray-400"
                >
                  Shipping
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* SHIPPING TAB */}
            {activeTab === "shipping" && (
              <div>
                <h2 className="mb-6 text-lg font-bold">SHIPPING METHOD</h2>
                <div className="space-y-3">
                  {[
                    {
                      id: "standard",
                      label: "Standard Shipping",
                      price: "$10",
                      time: "5-7 business days",
                    },
                    {
                      id: "express",
                      label: "Express Shipping",
                      price: "$25",
                      time: "2-3 business days",
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        defaultChecked={option.id === "standard"}
                        className="w-4 h-4"
                      />
                      <div className="flex-1 ml-4">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">
                          {option.time}
                        </div>
                      </div>
                      <div className="font-medium">{option.price}</div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setActiveTab("information")}
                    className="px-6 py-3 font-medium text-gray-800 transition border border-gray-300 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab("payment")}
                    className="flex items-center gap-2 px-6 py-3 font-medium text-white transition bg-black hover:bg-gray-800"
                  >
                    Continue to Payment
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* PAYMENT TAB */}
            {activeTab === "payment" && (
              <div>
                <h2 className="mb-6 text-lg font-bold">PAYMENT METHOD</h2>
                <div className="space-y-3">
                  {[
                    { id: "card", label: "Credit / Debit Card" },
                    { id: "paypal", label: "PayPal" },
                    { id: "upi", label: "UPI (Google Pay, Apple Pay, etc.)" },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        defaultChecked={option.id === "card"}
                        className="w-4 h-4"
                      />
                      <div className="ml-4 font-medium">{option.label}</div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setActiveTab("shipping")}
                    className="px-6 py-3 font-medium text-gray-800 transition border border-gray-300 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="px-6 py-3 font-medium text-white transition bg-black hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">YOUR ORDER</h2>
                <span className="text-sm font-medium text-blue-600">
                  ({cartItems.length})
                </span>
              </div>

              {/* Cart Items */}
              <div className="pb-6 mb-6 space-y-4 border-b border-gray-200">
                {cartItems.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 overflow-hidden bg-gray-100 rounded shrink-0">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">
                          {item.product?.name || "Product"}
                        </h3>
                        <p className="mt-1 text-xs text-gray-600">
                          ${item.product?.price || "0"}
                        </p>
                      </div>
                      <div className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </div>
                    </div>

                    {/* Price & Change */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-sm font-medium">
                        $
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2,
                        )}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Shipping
                    <span className="ml-1 text-xs text-gray-400">
                      (Calculated at next step)
                    </span>
                  </span>
                  <span className="font-medium">
                    {shippingCost === 0
                      ? "FREE"
                      : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-bold">Total</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Back to Cart Link */}
              <button
                onClick={handleContinueShopping}
                className="w-full px-4 py-2 mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * CheckoutPage - Wrapped with ProtectedRoute
 */
function CheckoutPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}

export default CheckoutPage;
