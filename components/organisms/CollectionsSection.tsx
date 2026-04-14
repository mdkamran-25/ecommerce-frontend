/**
 * CollectionsSection.tsx - Organism Component
 * Complete XIV COLLECTIONS section with filters and products (TypeScript)
 */

import React from "react";
import SectionTitle from "../atoms/SectionTitle";
import ProductGrid from "../molecules/ProductGrid";
import CategoryFilter from "../molecules/CategoryFilter";
import { Product } from "../molecules/ProductCard";
import Text from "../atoms/Text";

interface CollectionsSectionProps {
  products?: Product[];
  loading?: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  addToCart: (product: Product) => void;
  className?: string;
}

const FILTER_OPTIONS = ["ALL", "Men", "Women", "EKO"];

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  products = [],
  loading = false,
  selectedCategory,
  onCategoryChange,
  addToCart,
  className = "",
}) => {
  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => {
          const category = p.category?.toLowerCase() ?? "";
          return category === selectedCategory.toLowerCase();
        });

  return (
    <section className={`px-6 py-16 bg-white md:px-12 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Section Header with Filters */}
        <div className="flex items-end justify-between mb-12">
          <SectionTitle>
            XIV
            <br />
            COLLECTIONS
            <br />
            23-24
          </SectionTitle>

          {/* Category Filters */}
          <CategoryFilter
            filters={FILTER_OPTIONS}
            activeFilter={selectedCategory}
            onFilterChange={onCategoryChange}
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-12 text-center">
            <Text color="muted" variant="body">
              Loading products...
            </Text>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid
            products={filteredProducts.slice(0, 9)}
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

        {/* Load More Button */}
        <div className="mt-12 text-center">
          <button className="text-sm font-semibold text-gray-600 transition hover:text-gray-900">
            Load more
          </button>
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
