/**
 * components/molecules/ProductCarousel.tsx
 * Swipeable product carousel for mobile
 */

import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ProductCard from "./ProductCard";
import { Product } from "../../types";

interface ProductCarouselProps {
  products: Product[];
  addToCart: (product: Product) => void;
  itemsPerView: number;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  addToCart,
  itemsPerView,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate max index based on products and items per view
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    // Threshold for swipe detection (50px)
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left - move forward
        handleNext();
      } else {
        // Swiped right - move backward
        handlePrev();
      }
    }

    setIsDragging(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView,
  );

  return (
    <div className="w-full">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="overflow-hidden"
      >
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
          }}
        >
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={() => addToCart(product)}
            />
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {products.length > itemsPerView && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center justify-center w-10 h-10 transition border ${
              currentIndex === 0
                ? "border-gray-300 text-gray-300 cursor-not-allowed"
                : "border-gray-400 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800"
            }`}
            aria-label="Previous products"
          >
            <IoIosArrowBack className="w-4 h-4" />
          </button>

          {/* Indicator Dots */}
          <div className="flex gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? "bg-gray-800" : "bg-gray-300"
                }`}
                aria-label={`Go to product group ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className={`flex items-center justify-center w-10 h-10 transition border ${
              currentIndex === maxIndex
                ? "border-gray-300 text-gray-300 cursor-not-allowed"
                : "border-gray-400 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800"
            }`}
            aria-label="Next products"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product Counter */}
      {products.length > 0 && (
        <div className="mt-4 text-sm text-center text-gray-600">
          Showing {Math.min(currentIndex + itemsPerView, products.length)} of{" "}
          {products.length}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
