/**
 * components/molecules/ProductCarousel.tsx
 * Smooth continuous scrolling carousel with momentum scrolling for mobile
 */

import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../../types";

interface ProductCarouselProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  addToCart,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      {/* Smooth Continuous Scrolling Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 pb-2 overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{
          scrollBehavior: "smooth",
          msOverflowStyle: "none", // Hide scrollbar in IE
          scrollbarWidth: "none", // Hide scrollbar in Firefox
        }}
      >
        {/* Hide scrollbar for Chrome, Safari, Edge */}
        <style>{`
          ::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {products.map((product) => (
          <div
            key={product.id}
            className="w-full shrink-0 snap-center"
            style={{ minWidth: "100%" }}
          >
            <ProductCard
              product={product}
              addToCart={() => addToCart(product)}
            />
          </div>
        ))}
      </div>

      {/* Product Counter */}
      {products.length > 0 && (
        <div className="mt-4 text-sm text-center text-gray-600">
          Swipe to see all {products.length} products
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
