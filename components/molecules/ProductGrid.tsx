/**
 * ProductGrid.tsx - Molecule Component
 * Reusable grid layout for displaying products (TypeScript)
 */

import React from "react";
import ProductCard, { Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  addToCart: (product: Product) => void;
  columns?: 3 | 4;
  gap?: 4 | 6 | 8;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  addToCart,
  columns = 4,
  gap = 6,
  className = "",
}) => {
  const columnClasses = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const gapClasses = {
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} addToCart={addToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;
