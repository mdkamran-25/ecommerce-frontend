/**
 * ProductImage.tsx - Atomic Product Image Component
 * Handles image display with aspect square and hover effects (TypeScript)
 */

import React from "react";
import Link from "next/link";

interface ProductImageProps {
  src?: string;
  alt: string;
  productId: string | number;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  productId,
  className = "",
}) => {
  return (
    <Link href={`/products/${productId}`}>
      <div
        className={`overflow-hidden bg-gray-50 border border-gray-300 rounded aspect-square cursor-pointer group transition hover:border-gray-600 ${className}`}
      >
        <img
          src={src || "https://via.placeholder.com/300x300"}
          alt={alt}
          className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
        />
      </div>
    </Link>
  );
};

export default ProductImage;
