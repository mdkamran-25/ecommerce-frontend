/**
 * ApproachSection.tsx - Organism Component
 * OUR APPROACH TO FASHION DESIGN section with mood board (TypeScript)
 */

import React from "react";
import SectionTitle from "../atoms/SectionTitle";
import Text from "../atoms/Text";

interface MoodBoardItem {
  title: string;
  color: string;
}

interface ApproachSectionProps {
  className?: string;
  description?: string;
}

const MOOD_BOARD_ITEMS: MoodBoardItem[] = [
  { title: "Elegance", color: "bg-blue-100" },
  { title: "Heritage", color: "bg-gray-200" },
  { title: "Innovation", color: "bg-gray-100" },
  { title: "Craftsmanship", color: "bg-yellow-50" },
];

const DEFAULT_DESCRIPTION =
  "at elegant vogue, we blend creativity with craftsmanship to create fashion that transcends trends. each fashion that transcends trends. each piece is meticulously crafted, ensuring the highest quality design is meticulously crafted, ensuring the highest quality and exquisite finish.";

export const ApproachSection: React.FC<ApproachSectionProps> = ({
  className = "",
  description = DEFAULT_DESCRIPTION,
}) => {
  return (
    <section className={`px-6 py-20 md:px-12 bg-gray-50 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <SectionTitle className="text-center mb-8">
          OUR APPROACH TO FASHION DESIGN
        </SectionTitle>

        {/* Description */}
        <Text
          variant="body"
          className="max-w-2xl mx-auto mb-16 leading-relaxed text-center text-gray-700"
        >
          {description}
        </Text>

        {/* Mood Board Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {MOOD_BOARD_ITEMS.map((item) => (
            <div
              key={item.title}
              className={`aspect-square rounded ${item.color} flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition`}
            >
              <div className="text-center">
                <Text variant="subtitle" weight="semibold" color="default">
                  {item.title}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApproachSection;
