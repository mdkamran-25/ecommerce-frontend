import Link from "next/link";
import { useContext, FC } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Product } from "../types";

/**
 * ProductCard Component
 * Displays product information with add-to-cart functionality
 */

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useContext(CartContext) as any;
  const { user } = useContext(AuthContext) as any;

  /**
   * Handle adding product to cart
   */
  const handleAddToCart = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      await addToCart(product.id, 1);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(
        "Failed to add to cart: " +
          (error.response?.data?.error || error.message),
      );
    }
  };

  return (
    <div className="transition-all duration-200 card hover:shadow-lg hover:-translate-y-1">
      {product.images?.[0] && (
        <div className="mb-4 relative w-full h-48 overflow-hidden rounded-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100%, 320px"
            className="object-cover"
            priority={false}
          />
        </div>
      )}

      <h3 className="mb-2 text-lg font-bold">{product.name}</h3>

      {product.compareAt && (
        <p className="mb-1 text-sm text-gray-500 line-through">
          ${product.compareAt}
        </p>
      )}

      <p className="mb-2 text-2xl font-bold text-green-600">
        ${product.price || 0}
      </p>

      <p className="mb-3 text-sm text-gray-600">
        {product.description
          ? product.description.substring(0, 80)
          : "No description"}
        ...
      </p>

      <p className="mb-4 text-sm">
        Stock: <strong>{product.stock}</strong>
      </p>

      <div className="flex gap-2">
        <Link href={`/products/${product.id}`} className="flex-1">
          <button className="w-full text-sm btn-primary">View Details</button>
        </Link>
        <button
          onClick={handleAddToCart}
          className="flex-1 text-sm btn-success"
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
