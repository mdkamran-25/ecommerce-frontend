/**
 * ProductImage.tsx - Atomic Product Image Component
 * Handles image display with aspect square and hover effects (TypeScript)
 */

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { optimizeImageKitUrl } from "../../utils/imagekit";

interface ProductImageProps {
  src?: string;
  alt: string;
  productId: string | number;
  className?: string;
}

// Placeholder data URL (1x1 transparent GIF)
// Lightweight inline placeholder so missing images never hit the network.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect fill='%23f3f4f6' width='300' height='300'/%3E%3Cpath d='M0 238h300' stroke='%23e5e7eb'/%3E%3Ccircle cx='112' cy='120' r='20' fill='%23e5e7eb'/%3E%3Cpath d='M78 200l48-48 34 34 28-28 34 42' fill='none' stroke='%23d1d5db' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  productId,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  // Optimize image URL for product card display (medium quality, 500x500 max)
  const optimizedSrc = src
    ? optimizeImageKitUrl(src, "card")
    : PLACEHOLDER_IMAGE;

  const displaySrc = imageError || !src ? PLACEHOLDER_IMAGE : optimizedSrc;

  return (
    <Link href={`/products/${productId}`}>
      <div
        className={`overflow-hidden bg-gray-50 border border-gray-300 rounded aspect-square cursor-pointer group transition hover:border-gray-600 relative ${className}`}
      >
        <Image
          src={displaySrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100%, (max-width: 1024px) 50%, 33%"
          className="object-cover transition duration-300 group-hover:scale-105"
          quality={100}
          unoptimized={true}
          priority={false}
          onError={() => {
            console.warn(`Failed to load image for product ${productId}:`, src);
            setImageError(true);
          }}
        />
      </div>
    </Link>
  );
};

export default ProductImage;
