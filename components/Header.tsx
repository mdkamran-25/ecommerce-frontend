/**
 * components/Header.tsx
 * Main navigation header component (TypeScript)
 */

import React, { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CiHeart } from "react-icons/ci";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { AiOutlineUser } from "react-icons/ai";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import * as authService from "../services/authService";

interface NavLink {
  label: string;
  href: string;
}

interface Category {
  label: string;
  href: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleLogout = async (): Promise<void> => {
    try {
      await authService.logout();
      logout();
      router.push("/auth/login");
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const navLinks: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/products?collection=true" },
    { label: "New", href: "/products?sort=new" },
  ];

  const categories: Category[] = [
    { label: "MEN", href: "/products?category=men" },
    { label: "WOMEN", href: "/products?category=women" },
    { label: "KIDS", href: "/products?category=kids" },
  ];

  return (
    <>
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 ">
        <nav
          className="relative flex items-center justify-between max-w-full px-4 py-4"
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
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M18.75 8.75L0.75 8.75"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M13.75 16.75H0.75"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
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

          {/* Center: Brand Logo - Centered on Mobile */}
          <div className="absolute transform -translate-x-1/2 left-1/2 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link href="/" className="shrink-0">
              <img
                src="/icons/brandlogo.svg"
                alt="Brand Logo"
                className="h-8"
              />
            </Link>
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center gap-2 md:gap-8">
            {/* Wishlist Icon - Hidden on Mobile, Shown on Desktop */}
            <button
              className="hidden p-2.5 text-white transition bg-black rounded-full hover:bg-gray-800 md:block"
              title="Wishlist"
            >
              <CiHeart className="w-6 h-6" />
            </button>

            {/* Cart Icon with Badge */}
            <div className="flex items-center gap-0 md:gap-0">
              {/* Cart Text - Hidden on Mobile, Shown on Desktop */}
              <span
                className="hidden px-4 py-2.5 text-white bg-black rounded-full md:inline-block"
                style={{ marginRight: "-4px", zIndex: 10 }}
              >
                Cart
              </span>
              {/* Cart Button - Different Styling for Mobile vs Desktop */}
              <Link
                href="/cart"
                className="relative p-2 text-black transition border-4 border-black rounded-full hover:bg-gray-100 md:p-2 md:bg-white md:border-4 md:border-black md:text-gray-800 md:hover:bg-gray-100"
                title="Shopping Cart"
              >
                <HiOutlineShoppingCart
                  className="w-4 h-4 md:w-5 md:h-5"
                  style={{ strokeWidth: 2 }}
                />
                {cart?.items?.length > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-800 rounded-full -top-1 -right-3 md:bg-gray-800 md:border-2 md:border-white">
                    {cart.items.length}
                  </span>
                )}
              </Link>
            </div>

            {/* User Account Icon */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-3 text-white transition bg-black rounded-full hover:bg-gray-900"
                title="Account"
              >
                <AiOutlineUser className="w-4 h-4 md:w-5 md:h-5" />
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
          className="fixed inset-0 z-30 bg-transparent md:hidden"
          onClick={() => setShowSidebar(false)}
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
      </aside>
    </>
  );
};

export default Header;
