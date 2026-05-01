/**
 * NewThisWeekSection.tsx - Organism Component
 * Complete NEW THIS WEEK section with products and pagination (TypeScript)
 */

import React, { useState } from "react";
import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import SectionTitle from "../atoms/SectionTitle";
import ProductGrid from "../molecules/ProductGrid";
import { Product } from "../../types";

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
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Handle responsive items per page
  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <section className={`${className}`}>
      <div className="w-full px-0 pt-20 md:py-0 lg:py-0 md:mx-auto md:max-w-7xl md:px-0">
        {/* Section Header */}
        <div className="flex flex-col gap-3 mb-6 md:mb-12 md:flex-row md:items-center md:justify-between">
          <Link href="/products" className="group">
            <div className="flex items-center gap-2 cursor-pointer md:gap-3">
              <SectionTitle className="text-2xl font-black leading-none transition md:text-5xl group-hover:text-blue-600">
                NEW
                <br />
                THIS WEEK
              </SectionTitle>
              <span className="ml-1 text-lg font-bold text-blue-600 md:ml-2 md:text-2xl">
                ({totalCount})
              </span>
            </div>
          </Link>
          <Link
            href="/products"
            className="text-xs font-medium text-gray-600 transition md:text-sm hover:text-gray-800 whitespace-nowrap"
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
        <div className="flex items-center justify-center gap-2 mt-6 md:gap-3 md:mt-12">
          <button
            onClick={handlePrevious}
            disabled={currentPosition === 0}
            className="flex items-center justify-center w-10 h-10 text-gray-800 transition border border-gray-400 md:w-12 md:h-12 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoIosArrowBack className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentPosition >= maxPosition}
            className="flex items-center justify-center w-10 h-10 text-gray-800 transition border border-gray-400 md:w-12 md:h-12 hover:bg-gray-800 hover:text-white hover:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoIosArrowForward className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewThisWeekSection;
