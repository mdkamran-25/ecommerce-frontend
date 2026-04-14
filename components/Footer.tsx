/**
 * components/Footer.tsx
 * Footer component (TypeScript)
 */

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-12 text-white bg-gray-900">
      <div className="max-w-6xl px-4 mx-auto text-center">
        <p>&copy; 2026 eCommerce Store. All rights reserved.</p>
        <p className="mt-4 text-sm text-gray-400">
          |{" "}
          <a href="#" className="transition hover:text-white">
            About
          </a>{" "}
          |{" "}
          <a href="#" className="transition hover:text-white">
            Contact
          </a>{" "}
          |{" "}
          <a href="#" className="transition hover:text-white">
            Privacy
          </a>{" "}
          |
        </p>
      </div>
    </footer>
  );
};

export default Footer;
