/**
 * ProductCard.tsx - Molecule Component
 * Combines ProductImage atom with product details and add to cart button (TypeScript)
 */

import React from "react";
import Link from "next/link";
import ProductImage from "../atoms/ProductImage";
import Text from "../atoms/Text";
import Price from "../atoms/Price";
import { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
  cardSize?: "default" | "large";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  addToCart,
  cardSize = "default",
}) => {
  return (
    <div className="cursor-pointer group">
      {/* Product Image Container */}
      <div className="relative mb-3 md:mb-4">
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          productId={product.id}
        />
        {/* Plus Button */}
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          title="Add to cart"
        >
          <span className="text-xl font-light">+</span>
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {/* Category Label */}
        {product.category && (
          <Text
            variant="caption"
            color="muted"
            className="text-xs uppercase tracking-wider"
          >
            {typeof product.category === "string"
              ? product.category
              : product.category.name}
          </Text>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <Text
            variant={cardSize === "large" ? "subtitle" : "body"}
            weight="bold"
            className="mb-2 transition group-hover:text-gray-600 line-clamp-2 text-sm md:text-base"
          >
            {product.name}
          </Text>
        </Link>

        {/* Price and Variants */}
        <div className="flex items-center justify-between">
          <Price amount={product.price} className="mb-0 text-sm md:text-base" />
          {product.variantCount && product.variantCount > 0 && (
            <Text variant="caption" color="muted" className="text-xs">
              +{product.variantCount}
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
