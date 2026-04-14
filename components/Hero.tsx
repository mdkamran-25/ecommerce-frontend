/**
 * components/Hero.tsx
 * Hero section component (TypeScript)
 */

import { ReactNode } from "react";
import { FiSearch } from "react-icons/fi";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: ReactNode;
}

const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  children,
}) => {
  return (
    <section className="grid min-h-screen grid-cols-1 gap-0 md:grid-cols-3">
      {/* Left: Categories, Search & Text Content */}
      <div className="flex flex-col px-6 py-12 md:px-8">
        {/* Categories Section */}
        <div className="mb-8">
          <div className="space-y-1">
            {["MEN", "WOMEN", "KIDS"].map((category) => (
              <p
                key={category}
                className="text-sm tracking-wide text-gray-800 transition cursor-pointer font-extralight hover:text-gray-600"
              >
                {category}
              </p>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form
            onSubmit={onSearch}
            className="flex items-center gap-3 px-4 py-3 bg-transparent border border-gray-400"
          >
            <FiSearch className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 text-sm text-gray-800 placeholder-gray-500 bg-transparent outline-none"
            />
          </form>
        </div>

        {/* Text Content */}
        <div className="flex flex-col justify-between flex-1">
          <div>
            <h1
              className="text-5xl font-light leading-tight text-gray-900 md:text-6xl"
              style={{
                fontFamily:
                  "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              New Collection
            </h1>
          </div>

          {/* Go To Shop Button - Now on Left Side */}
          {children}
        </div>
      </div>

      {/* Center: Large Image */}
      <div className="flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-50">
        <img
          src="/img/Homepageimage2.png"
          alt="Featured Collection"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right: Featured Product & CTA */}
      <div className="flex flex-col items-center justify-between p-8 bg-white md:p-12">
        <div className="w-full">
          <img
            src="/img/HomepageImage1.png"
            alt="Featured Product"
            className="object-cover w-full h-64 mb-6 rounded-lg"
          />
          <h2 className="mb-2 text-2xl font-light text-gray-900">
            Featured Item
          </h2>
          <p className="mb-6 text-sm font-light text-gray-600">
            Handpicked exclusive piece from our newest collection
          </p>
          <button className="w-full px-6 py-3 text-sm font-medium text-white transition bg-gray-900 rounded-lg hover:bg-gray-800">
            Discover Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
