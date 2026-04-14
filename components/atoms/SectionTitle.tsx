/**
 * SectionTitle.tsx - Atomic Section Title Component
 * Reusable heading for sections with Beatrice font (TypeScript)
 */

import React, { JSX } from "react";

interface SectionTitleProps {
  children: React.ReactNode;
  separator?: boolean;
  className?: string;
  level?: "h1" | "h2" | "h3" | "h4";
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  separator = false,
  className = "",
  level = "h3",
}) => {
  const baseClass = "text-4xl font-black md:text-5xl font-beatrice";
  const Tag = level as keyof JSX.IntrinsicElements;

  return React.createElement(
    Tag,
    { className: `${baseClass} ${className}` },
    <>
      {children}
      {separator && <span className="ml-2 text-xl text-blue-600">(SO)</span>}
    </>,
  );
};

export default SectionTitle;
