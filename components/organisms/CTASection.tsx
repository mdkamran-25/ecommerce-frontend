/**
 * CTASection.tsx - Organism Component
 * DISCOVER MORE call-to-action section (TypeScript)
 */

import React from "react";
import Link from "next/link";
import SectionTitle from "../atoms/SectionTitle";
import Button from "../atoms/Button";
import Text from "../atoms/Text";

interface CTASectionProps {
  className?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  className = "",
  title = "DISCOVER MORE",
  description = "Explore our full collection and find your perfect piece",
  buttonText = "Browse Collection",
  buttonLink = "/products",
}) => {
  return (
    <section
      className={`px-6 py-20 text-white bg-gray-900 md:px-12 ${className}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <SectionTitle className="text-white mb-6">{title}</SectionTitle>

        <Text variant="body" className="max-w-xl mx-auto mb-8 text-gray-300">
          {description}
        </Text>

        <Link href={buttonLink}>
          <Button
            variant="secondary"
            className="bg-white text-gray-900 border-0 hover:bg-gray-100"
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
