/**
 * NewThisWeekSection.tsx - Organism Component
 * Complete NEW THIS WEEK section with products and pagination (TypeScript)
 */

import React, { useState } from "react";
import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import SectionTitle from "../atoms/SectionTitle";
import ProductGrid from "../molecules/ProductGrid";
import { Product } from "../molecules/ProductCard";

interface NewThisWeekSectionProps {
  products?: Product[];
  addToCart: (product: Product) => void;
  totalCount?: number;
  className?: string;
}

export const NewThisWeekSection: React.FC<NewThisWeekSectionProps> = ({
  products = [],
  addToCart,
  totalCount = 50,
  className = "",
}) => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const itemsPerPage = 4;
  const maxPosition = Math.max(0, products.length - itemsPerPage);

  // Reset position if products change
  React.useEffect(() => {
    if (currentPosition > maxPosition) {
      setCurrentPosition(maxPosition);
    }
  }, [maxPosition, currentPosition]);

  const displayedProducts = products.slice(
    currentPosition,
    currentPosition + itemsPerPage,
  );

  const handlePrevious = () => {
    setCurrentPosition((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPosition((prev) => Math.min(maxPosition, prev + 1));
  };

  return (
    <section className={` ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/products" className="group">
            <div className="flex items-center gap-3 cursor-pointer">
              <SectionTitle className="text-5xl font-black leading-none transition group-hover:text-blue-600">
                NEW
                <br />
                THIS WEEK
              </SectionTitle>
              <span className="ml-2 text-2xl font-bold text-blue-600">
                ({totalCount})
              </span>
            </div>
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-800"
          >
            See All
          </Link>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={displayedProducts}
          addToCart={addToCart}
          columns={4}
        />

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-12">
          <button
            onClick={handlePrevious}
            disabled={currentPosition === 0}
            className="flex items-center justify-center w-12 h-12 text-gray-800 transition border border-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoIosArrowBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentPosition >= maxPosition}
            className="flex items-center justify-center w-12 h-12 text-gray-800 transition border border-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoIosArrowForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewThisWeekSection;
