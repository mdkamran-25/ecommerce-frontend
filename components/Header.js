import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import * as authService from "../services/authService";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.push("/auth/login");
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top Navigation Bar */}
      <nav className="px-4 py-3 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="text-2xl font-bold text-transparent bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text">
              eCommerce
            </span>
          </Link>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 mx-8">
            <div className="flex items-center overflow-hidden transition bg-gray-100 border border-transparent rounded-lg hover:border-gray-300">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-500 bg-transparent outline-none"
              />
              <button
                type="submit"
                className="px-4 py-3 text-gray-600 transition hover:text-blue-600"
                title="Search"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <button
              className="p-2 text-gray-700 transition rounded-lg hover:text-red-600 hover:bg-red-50"
              title="Wishlist"
            >
              ♥️
            </button>

            {/* Notifications */}
            <button
              className="p-2 text-gray-700 transition rounded-lg hover:text-blue-600 hover:bg-blue-50"
              title="Notifications"
            >
              🔔
            </button>

            {/* Help */}
            <button
              className="p-2 text-gray-700 transition rounded-lg hover:text-green-600 hover:bg-green-50"
              title="Help"
            >
              ❓
            </button>

            {/* Authenticated User Menu */}
            {user ? (
              <>
                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 text-gray-700 transition rounded-lg hover:bg-gray-100"
                    title="Account"
                  >
                    👤
                    <span className="text-sm font-medium">
                      {user.firstName}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full min-w-64">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/account/profile"
                        className="flex items-center px-4 py-3 text-gray-700 transition border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span className="mr-3">👤</span>
                        View your profile
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-3 text-gray-700 transition border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span className="mr-3">📦</span>
                        Purchases and orders
                      </Link>

                      <Link
                        href="/account/change-password"
                        className="flex items-center px-4 py-3 text-gray-700 transition border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span className="mr-3">🔐</span>
                        Change password
                      </Link>

                      <button
                        className="flex items-center w-full px-4 py-3 text-left text-gray-700 transition border-b border-gray-100 hover:bg-gray-50"
                        title="Account Settings"
                      >
                        <span className="mr-3">⚙️</span>
                        Account settings
                      </button>

                      <button
                        className="flex items-center w-full px-4 py-3 text-left text-gray-700 transition border-b border-gray-100 hover:bg-gray-50"
                        title="Help Centre"
                      >
                        <span className="mr-3">💬</span>
                        Help Centre
                      </button>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 font-medium text-left text-red-600 transition hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                {/* Cart Icon - Only for logged-in users */}
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700 transition rounded-lg hover:text-blue-600 hover:bg-blue-50"
                  title="Shopping Cart"
                >
                  🛒
                  {cart?.itemCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {cart.itemCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              /* Non-Authenticated User - Sign In/Sign Up Buttons */
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 font-medium text-gray-700 transition rounded-lg hover:text-blue-600 hover:bg-gray-100"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Horizontal Navigation Menu */}
      {user && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-6 px-4 py-2 mx-auto overflow-x-auto max-w-7xl">
            <Link
              href="/products"
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                router.pathname === "/products"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              🏪 All Products
            </Link>
            <Link
              href="/products?category=new"
              className="px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-blue-600 whitespace-nowrap"
            >
              ✨ New Arrivals
            </Link>
            <Link
              href="/products?category=featured"
              className="px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-blue-600 whitespace-nowrap"
            >
              ⭐ Featured
            </Link>
            <Link
              href="/orders"
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                router.pathname === "/orders"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              📦 My Orders
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
