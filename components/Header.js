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
  const [showSidebar, setShowSidebar] = useState(false);
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

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/products?collection=true" },
    { label: "New", href: "/products?sort=new" },
  ];

  const categories = [
    { label: "MEN", href: "/products?category=men" },
    { label: "WOMEN", href: "/products?category=women" },
    { label: "KIDS", href: "/products?category=kids" },
  ];

  return (
    <>
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <nav
          className="flex items-center justify-between max-w-full px-6 py-4"
          style={{
            fontFamily:
              "'Beatrice Deck Trial', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {/* Left Section: Hamburger Menu, Logo & Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-800 transition rounded-lg hover:bg-gray-100"
              title="Menu"
            >
              <svg
                width="28"
                height="18"
                viewBox="0 0 28 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M26.75 0.75L0.750001 0.75"
                  stroke="black"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M18.75 8.75L0.75 8.75"
                  stroke="black"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M13.75 16.75H0.75"
                  stroke="black"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            {/* Desktop Navigation Links */}
            <div className="items-center hidden gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-wide text-gray-800 transition hover:text-gray-600"
                  style={{
                    fontFamily:
                      "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Divider with Design Element */}
          <div className="items-center justify-center flex-1 hidden mx-6 md:flex">
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              {/* Brand Logo */}
              <Link href="/" className="hidden md:block shrink-0">
                <img
                  src="/icons/brandlogo.svg"
                  alt="Brand Logo"
                  className="h-8"
                />
              </Link>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist Icon */}
            <button
              className="p-2 text-gray-800 transition rounded-lg hover:bg-gray-100"
              title="Wishlist"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>

            {/* Cart Icon with Badge */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-800 transition rounded-lg hover:bg-gray-100"
              title="Shopping Cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cart?.items?.length > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-800 rounded-full">
                  {cart.items.length}
                </span>
              )}
            </Link>

            {/* User Account Icon */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-gray-800 transition rounded-lg hover:bg-gray-100"
                title="Account"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 z-50 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {user ? (
                    <>
                      <div className="px-4 py-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/account/profile"
                        className="block px-4 py-3 text-sm text-gray-700 border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>

                      <Link
                        href="/orders"
                        className="block px-4 py-3 text-sm text-gray-700 border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Orders
                      </Link>

                      <Link
                        href="/account/change-password"
                        className="block px-4 py-3 text-sm text-gray-700 border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Change Password
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-sm font-medium text-left text-gray-700 border-t border-gray-100 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-3 text-sm text-gray-700 border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden"
          onClick={() => setShowSidebar(false)}
          style={{ transition: "background-color 0.3s ease" }}
        />
      )}

      {/* Sidebar Menu */}
      <aside
        className={`fixed left-0 top-0 z-40 w-72 h-screen bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          fontFamily:
            "'Beatrice Deck Trial', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Sidebar Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" className="shrink-0">
            <img src="/icons/brandlogo.svg" alt="Brand Logo" className="h-8" />
          </Link>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-6 border-b border-gray-200">
          <div className="flex items-center overflow-hidden bg-gray-100 rounded-lg">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-3 py-2.5 text-gray-600 hover:text-gray-900"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Categories Section */}
        <div className="px-6 py-4">
          <h3 className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Categories
          </h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="block text-sm font-medium text-gray-800 transition hover:text-gray-600"
                onClick={() => setShowSidebar(false)}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-gray-800 transition hover:text-gray-600"
                onClick={() => setShowSidebar(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Auth Links */}
        {!user && (
          <div className="px-6 py-4 space-y-3 border-t border-gray-200">
            <Link
              href="/auth/login"
              className="block px-4 py-2.5 text-sm text-gray-800 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
              onClick={() => setShowSidebar(false)}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block px-4 py-2.5 text-sm text-white bg-gray-800 rounded-lg text-center hover:bg-gray-900 transition"
              onClick={() => setShowSidebar(false)}
            >
              Sign Up
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
