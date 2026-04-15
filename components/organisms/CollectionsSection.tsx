/**
 * CollectionsSection.tsx - Organism Component
 * Complete XIV COLLECTIONS section with filters and products (TypeScript)
 */

import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import SectionTitle from "../atoms/SectionTitle";
import ProductGrid from "../molecules/ProductGrid";
import CategoryFilter from "../molecules/CategoryFilter";
import { Product } from "../../types";
import Text from "../atoms/Text";

interface CollectionsSectionProps {
  products?: Product[];
  loading?: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  addToCart: (product: Product) => void;
  className?: string;
}

const FILTER_OPTIONS = ["ALL", "Men", "Women", "KID"];

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  products = [],
  loading = false,
  selectedCategory,
  onCategoryChange,
  addToCart,
  className = "",
}) => {
  const [sortBy, setSortBy] = useState("default");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => {
          const categoryValue =
            typeof p.category === "string"
              ? p.category
              : (p.category?.name ?? "");
          return categoryValue.toLowerCase() === selectedCategory.toLowerCase();
        });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low-to-high") {
      return (a.price || 0) - (b.price || 0);
    } else if (sortBy === "high-to-low") {
      return (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  return (
    <section className={`mt-24 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex items-start justify-between mb-12">
          {/* Left Side - Title and Filters */}
          <div>
            <SectionTitle className="text-5xl font-black leading-none transition group-hover:text-blue-600">
              XIV
              <br />
              COLLECTIONS
              <br />
              26-27
            </SectionTitle>

            {/* Category Filters */}
            <div className="flex gap-6 mt-8">
              {FILTER_OPTIONS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => onCategoryChange(filter)}
                  className={`text-sm font-medium transition ${
                    selectedCategory === filter
                      ? "text-black"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Filters and Sorts */}
          <div className="flex flex-col items-end gap-6">
            {/* Filters Button */}
            <button className="flex items-center gap-2 text-sm font-medium text-gray-800 transition hover:text-black">
              Filters(+)
            </button>

            {/* Sorts Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 text-sm font-medium text-gray-800 transition hover:text-black"
              >
                Sorts(+)
                <IoIosArrowDown
                  className={`w-4 h-4 transition ${
                    showSortMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Sort Dropdown Menu */}
              {showSortMenu && (
                <div className="absolute right-0 z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg top-full">
                  <button
                    onClick={() => {
                      setSortBy("default");
                      setShowSortMenu(false);
                    }}
                    className={`block w-full text-right px-4 py-2 text-sm transition ${
                      sortBy === "default"
                        ? "text-black font-semibold"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("low-to-high");
                      setShowSortMenu(false);
                    }}
                    className={`block w-full text-right px-4 py-2 text-sm transition ${
                      sortBy === "low-to-high"
                        ? "text-black font-semibold"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    Less to more
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("high-to-low");
                      setShowSortMenu(false);
                    }}
                    className={`block w-full text-right px-4 py-2 text-sm transition ${
                      sortBy === "high-to-low"
                        ? "text-black font-semibold"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    More to Less
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-12 text-center">
            <Text color="muted" variant="body">
              Loading products...
            </Text>
          </div>
        ) : sortedProducts.length > 0 ? (
          <ProductGrid
            products={
              showAllProducts ? sortedProducts : sortedProducts.slice(0, 3)
            }
            addToCart={addToCart}
            columns={3}
          />
        ) : (
          <div className="py-12 text-center">
            <Text color="muted" variant="body">
              No products found in this category.
            </Text>
          </div>
        )}

        {/* More Button */}
        {sortedProducts.length > 3 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAllProducts(!showAllProducts)}
              className="flex flex-col items-center gap-2 mx-auto"
            >
              <span className="text-sm font-semibold text-gray-600 transition hover:text-gray-900">
                {showAllProducts ? "Less" : "More"}
              </span>
              <div className="text-gray-400 transition hover:text-gray-900">
                <IoIosArrowDown
                  className={`w-6 h-6 transition ${
                    showAllProducts ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionsSection;
