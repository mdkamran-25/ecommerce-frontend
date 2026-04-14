/**
 * ProductCard.tsx - Molecule Component
 * Combines ProductImage atom with product details and add to cart button (TypeScript)
 */

import React from "react";
import Link from "next/link";
import ProductImage from "../atoms/ProductImage";
import Button from "../atoms/Button";
import Text from "../atoms/Text";
import Price from "../atoms/Price";

export interface Product {
  id: string | number;
  name: string;
  image?: string;
  price?: number;
  category?: string;
  description?: string;
}

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
  const textSize = cardSize === "large" ? "text-base" : "text-sm";

  return (
    <div className="cursor-pointer group">
      <ProductImage
        src={product.image}
        alt={product.name}
        productId={product.id}
      />

      <Link href={`/products/${product.id}`}>
        <Text
          variant={cardSize === "large" ? "subtitle" : "caption"}
          className="mb-2 transition group-hover:text-gray-600"
        >
          {product.name}
        </Text>
      </Link>

      <Price amount={product.price} className="mb-4" />

      <Button
        onClick={() => addToCart(product)}
        variant="primary"
        size="md"
        className="w-full"
      >
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductCard;
