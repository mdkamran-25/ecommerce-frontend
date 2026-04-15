/**
 * Price.tsx - Atomic Price Component
 * Displays product price with consistent formatting (TypeScript)
 */

import React from "react";

interface PriceProps {
  amount: number | string | undefined;
  className?: string;
  currency?: string;
}

export const Price: React.FC<PriceProps> = ({
  amount,
  className = "",
  currency = "$",
}) => {
  const formattedPrice =
    typeof amount === "number" ? amount.toFixed(2) : amount || "0.00";

  return (
    <p className={`text-sm font-semibold text-gray-800 ${className}`}>
      {currency}
      {formattedPrice}
    </p>
  );
};

export default Price;
