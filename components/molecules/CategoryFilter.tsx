/**
 * CategoryFilter.tsx - Molecule Component
 * Reusable category/filter button group (TypeScript)
 */

import React from "react";

interface CategoryFilterProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  filters = [],
  activeFilter,
  onFilterChange,
  className = "",
}) => {
  return (
    <div className={`flex gap-6 text-sm ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`font-semibold transition ${
            activeFilter === filter
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
