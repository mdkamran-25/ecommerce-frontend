import { useContext, useEffect, JSX, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { CiHeart } from "react-icons/ci";
import { FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";

/**
 * WishlistPageContent Component
 * Displays user's saved wishlist items
 */
function WishlistPageContent(): JSX.Element {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useContext(
    WishlistContext,
  ) as any;
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemoveItem = async (productId: string) => {
    try {
      setRemoving(productId);
      await removeFromWishlist(productId);
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemoving(null);
    }
  };

  const handleClearWishlist = async () => {
    await clearWishlist();
  };

  if (loading) {
    return (
      <div className="loading">
        <Head>
          <title>My Wishlist - eCommerce Store</title>
        </Head>
        Loading your wishlist...
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CiHeart className="w-8 h-8" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>
            {wishlist.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {wishlist.length === 0 ? (
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
                Browse Products
              </Link>
            </div>
          ) : (
            <div>
              <p className="mb-6 text-gray-600">
                You have {wishlist.length} item
                {wishlist.length !== 1 ? "s" : ""} in your wishlist
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {wishlist.map((item: any) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
                  >
                    {/* Product Image */}
                    <Link href={`/products/${item.productId}`}>
                      <div className="relative bg-gray-100 h-48 overflow-hidden group cursor-pointer">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            sizes="(max-width: 640px) 100%, 300px"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            priority={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        {item.product.compareAt && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-sm rounded">
                            Sale
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2 cursor-pointer">
                          {item.product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-lg font-bold text-gray-900">
                          ${item.product.price}
                        </p>
                        {item.product.compareAt && (
                          <p className="text-sm text-gray-500 line-through">
                            ${item.product.compareAt}
                          </p>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        <p
                          className={`text-sm font-semibold ${
                            item.product.stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.product.stock > 0
                            ? `${item.product.stock} In Stock`
                            : "Out of Stock"}
                        </p>
                      </div>

                      {/* Category */}
                      {item.product.category && (
                        <p className="text-xs text-gray-500 mb-4">
                          {typeof item.product.category === "string"
                            ? item.product.category
                            : item.product.category?.name}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/products/${item.productId}`}
                          className="flex-1"
                        >
                          <button className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
                            View Details
                          </button>
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={removing === item.productId}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                          title="Remove from wishlist"
                        >
                          <FiHeart className="w-5 h-5 text-red-600" />
                        </button>
                      </div>

                      {/* Added Date */}
                      <p className="text-xs text-gray-400 mt-3">
                        Added{" "}
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Wishlist Page with Protected Route
 */
const WishlistPage = (): JSX.Element => {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
};

export default WishlistPage;
