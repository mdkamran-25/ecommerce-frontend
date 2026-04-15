/**
 * Text.tsx - Atomic Text Component
 * Reusable text/typography with consistent styling (TypeScript)
 */

import React from "react";

interface TextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "body" | "caption" | "subtitle" | "overline";
  weight?: "light" | "normal" | "semibold" | "bold";
  color?: "default" | "muted" | "error" | "success";
  align?: "left" | "center" | "right";
  truncate?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  className = "",
  variant = "body",
  weight = "normal",
  color = "default",
  align = "left",
  truncate = false,
}) => {
  const variantClasses = {
    body: "text-sm",
    caption: "text-xs",
    subtitle: "text-lg",
    overline: "text-xs uppercase tracking-wide",
  };

  const weightClasses = {
    light: "font-light",
    normal: "font-normal",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const colorClasses = {
    default: "text-gray-800",
    muted: "text-gray-600",
    error: "text-red-600",
    success: "text-green-600",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const finalClassName = `${variantClasses[variant]} ${weightClasses[weight]} ${colorClasses[color]} ${alignClasses[align]} ${truncate ? "truncate" : ""} ${className}`;

  return <span className={finalClassName}>{children}</span>;
};

export default Text;
