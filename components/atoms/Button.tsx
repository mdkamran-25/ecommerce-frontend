/**
 * Button.tsx - Atomic Button Component
 * Reusable button with multiple variants (TypeScript)
 */

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  [key: string]: any;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  ...props
}) => {
  const baseStyles = "transition font-semibold rounded";

  const variants = {
    primary: "bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400",
    secondary:
      "bg-transparent border border-gray-400 text-gray-800 hover:text-black disabled:text-gray-400",
    ghost:
      "bg-transparent text-gray-600 hover:text-gray-800 disabled:text-gray-300",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const finalClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={finalClassName}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
