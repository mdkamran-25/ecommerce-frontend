/**
 * ApproachSection.tsx - Organism Component
 * OUR APPROACH TO FASHION DESIGN section with mood board (TypeScript)
 */

import React from "react";
import Image from "next/image";
import SectionTitle from "../atoms/SectionTitle";
import Text from "../atoms/Text";

interface ApproachSectionProps {
  className?: string;
  description?: string;
}

const DEFAULT_DESCRIPTION =
  "at elegant vogue, we blend creativity with craftsmanship to create fashion that transcends trends and stands the test of time each design is meticulously crafted, ensuring the highest quality exquisite finish.";

export const ApproachSection: React.FC<ApproachSectionProps> = ({
  className = "",
  description = DEFAULT_DESCRIPTION,
}) => {
  return (
    <section className={`mt-24 mb-24 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <SectionTitle className="mb-4 md:mb-6 text-2xl md:text-6xl text-center text-black font-extralight">
          OUR APPROACH TO FASHION DESIGN
        </SectionTitle>

        {/* Description */}
        <div className="flex justify-center">
          <p
            className="max-w-2xl text-sm md:text-lg font-light leading-normal text-center text-gray-700 wrap-break-words px-4"
            style={{
              fontWeight: 100,
            }}
          >
            {description}
          </p>
        </div>

        {/* Mood Board Gallery Grid */}
        <div className="grid items-end grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-12 md:py-24 mx-auto max-w-7xl">
          {/* Image 1 - Left Large */}
          <div className="relative col-span-1 md:col-span-3 overflow-hidden border border-gray-300 rounded h-48 md:h-80">
            <Image
              src="/img/Footerimg1.png"
              alt="Elegance"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </div>

          {/* Image 2 - Center Medium */}
          <div className="relative col-span-1 md:col-span-3 overflow-hidden border border-gray-300 rounded md:top-20 h-48 md:h-80">
            <Image
              src="/img/footerimg2.png"
              alt="Heritage"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </div>

          {/* Image 3 - Right Medium */}
          <div className="relative col-span-1 md:col-span-3 overflow-hidden border border-gray-300 rounded h-48 md:h-80">
            <Image
              src="/img/footerimg3.png"
              alt="Innovation"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </div>

          {/* Image 4 - Far Right Large */}
          <div className="relative col-span-1 md:col-span-3 overflow-hidden border border-gray-300 rounded md:top-20 h-48 md:h-80">
            <Image
              src="/img/Homepageimage2.png"
              alt="Craftsmanship"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproachSection;
