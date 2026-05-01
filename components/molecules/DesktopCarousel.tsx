/**
 * components/molecules/DesktopCarousel.tsx
 * Desktop carousel with button controls for products
 */

import React, { useState, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../../types";

interface DesktopCarouselProps {
  products: Product[];
  addToCart: (product: Product) => void;
  itemsPerView?: number;
  currentIndex?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

const DesktopCarousel: React.FC<DesktopCarouselProps> = ({
  products,
  addToCart,
  itemsPerView = 2,
  currentIndex: externalIndex,
  onPrev,
  onNext,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = externalIndex ?? internalIndex;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate max scrollable index
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      setInternalIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      setInternalIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
    }
  };

  // Scroll to current index with smooth animation
  useEffect(() => {
    if (scrollContainerRef.current) {
      const itemWidth =
        scrollContainerRef.current.scrollWidth / products.length;
      scrollContainerRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex, products.length]);

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView,
  );

  return (
    <div className="w-full">
      {/* Carousel Container */}
      <div ref={scrollContainerRef} className="flex gap-8 overflow-hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0"
            style={{ width: `calc(50% - 16px)` }}
          >
            <ProductCard
              product={product}
              addToCart={() => addToCart(product)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopCarousel;
