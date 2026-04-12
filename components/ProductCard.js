import Link from "next/link";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      await addToCart(product.id, 1);
      alert("✅ Added to cart!");
    } catch (error) {
      alert(
        "❌ Failed to add to cart: " + error.response?.data?.error ||
          error.message,
      );
    }
  };

  return (
    <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      {product.images?.[0] && (
        <div className="mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <h3 className="font-bold text-lg mb-2">{product.name}</h3>

      {product.compareAt && (
        <p className="text-gray-500 line-through text-sm mb-1">
          ₹{product.compareAt}
        </p>
      )}

      <p className="text-2xl font-bold text-green-600 mb-2">₹{product.price}</p>

      <p className="text-gray-600 text-sm mb-3">
        {product.description.substring(0, 80)}...
      </p>

      <p className="text-sm mb-4">
        Stock: <strong>{product.stock}</strong>
      </p>

      <div className="flex gap-2">
        <Link href={`/products/${product.id}`} className="flex-1">
          <button className="btn-primary w-full text-sm">View Details</button>
        </Link>
        <button
          onClick={handleAddToCart}
          className="btn-success flex-1 text-sm"
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
