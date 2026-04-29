import { useContext, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { CiHeart } from "react-icons/ci";

/**
 * WishlistPageContent Component
 * Displays user's saved wishlist items
 */
function WishlistPageContent(): JSX.Element {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  // Placeholder for wishlist items
  // In future, fetch from backend
  const wishlistItems = [];

  if (!user) {
    return <div className="loading">Redirecting...</div>;
  }

  return (
    <>
      <Head>
        <title>My Wishlist - eCommerce Store</title>
      </Head>

      <div className="max-w-6xl px-4 mx-auto mt-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <CiHeart className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-lg">
              <CiHeart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold text-gray-700">
                Your wishlist is empty
              </h2>
              <p className="mb-6 text-gray-600">
                Start adding items to your wishlist to save them for later
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 text-white bg-black rounded-lg hover:bg-gray-800 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {wishlistItems.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition"
                >
                  {/* Wishlist item will be rendered here */}
                  <div className="text-center text-gray-500">
                    Item {item.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Profile Link */}
        <div className="mt-8 text-center">
          <Link
            href="/account/profile"
            className="text-blue-600 hover:text-blue-800 transition"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </>
  );
}

/**
 * Wishlist Page with Protected Route
 * Redirects to login if user is not authenticated
 */
const WishlistPage = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
};

export default WishlistPage;
