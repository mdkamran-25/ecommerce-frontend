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
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <nav className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-bold text-gray-900">
            eCommerce Store
          </span>
        </Link>

        <div className="flex gap-8 items-center">
          <Link
            href="/products"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Products
          </Link>

          {user ? (
            <>
              <Link
                href="/cart"
                className="relative text-gray-700 hover:text-blue-600 transition"
              >
                Cart
                {cart?.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cart.itemCount}
                  </span>
                )}
              </Link>
              <Link
                href="/orders"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Orders
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition text-gray-700"
                >
                  {user.email}
                </button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg min-w-max z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
