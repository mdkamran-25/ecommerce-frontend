/**
 * Wishlist Heart Button
 * Button component to add/remove products from wishlist
 */

import React, { useContext, useState } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CiHeart } from "react-icons/ci";
import { FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = "",
  size = "md",
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(
    WishlistContext,
  ) as any;
  const [loading, setLoading] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 rounded-full transition ${
        inWishlist
          ? "bg-red-100 text-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${className} disabled:opacity-50`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {inWishlist ? (
        <FiHeart className={`${sizeClasses[size]} fill-current`} />
      ) : (
        <CiHeart className={sizeClasses[size]} />
      )}
    </button>
  );
};

export default WishlistButton;
