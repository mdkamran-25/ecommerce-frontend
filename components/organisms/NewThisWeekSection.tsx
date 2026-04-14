/**
 * NewThisWeekSection.tsx - Organism Component
 * Complete NEW THIS WEEK section with products and pagination (TypeScript)
 */

import React from "react";
import Link from "next/link";
import SectionTitle from "../atoms/SectionTitle";
import ProductGrid from "../molecules/ProductGrid";
import { Product } from "../molecules/ProductCard";

interface NewThisWeekSectionProps {
  products?: Product[];
  addToCart: (product: Product) => void;
  className?: string;
}

export const NewThisWeekSection: React.FC<NewThisWeekSectionProps> = ({
  products = [],
  addToCart,
  className = "",
}) => {
  return (
    <section className={`px-6 py-16 md:px-12 ${className}`}>
      <div className="max-w-7xl">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <SectionTitle separator={true}>
            NEW
            <br />
            THIS WEEK
          </SectionTitle>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 underline transition hover:text-gray-800"
          >
            See all
          </Link>
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} addToCart={addToCart} columns={4} />

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-12">
          <button className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition">
            ←
          </button>
          {[1, 2].map((page) => (
            <button
              key={page}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-semibold transition ${
                page === 1
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition">
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewThisWeekSection;
