/**
 * NewThisWeekSection.tsx - Organism Component
 * Complete NEW THIS WEEK section with products and pagination (TypeScript)
 */

import React, { useState } from "react";
import Link from "next/link";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = products.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <section className={`px-6 py-16 md:px-12 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <SectionTitle className="text-5xl font-black leading-none">
              NEW
              <br />
              THIS WEEK
            </SectionTitle>
            <span className="text-2xl font-bold text-blue-600 ml-2">
              ({totalCount})
            </span>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-800 transition"
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
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded hover:border-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded hover:border-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewThisWeekSection;
