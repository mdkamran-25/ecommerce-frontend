/**
 * components/Hero.tsx
 * Hero section component (TypeScript)
 */

import Link from "next/link";
import { useContext, useState } from "react";
import { FiSearch } from "react-icons/fi";
import ProductCard from "./molecules/ProductCard";
import ProductCarousel from "./molecules/ProductCarousel";
import DesktopCarousel from "./molecules/DesktopCarousel";
import { Product } from "../types";
import { CartContext } from "../context/CartContext";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  featuredProducts?: Product[];
}

const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  featuredProducts = [],
}) => {
  const { addToCart } = useContext(CartContext) as any;
  const [carouselIndex, setCarouselIndex] = useState(0);

  const itemsPerView = 2;
  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView);

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };
  return (
    <section className="grid grid-cols-1 gap-0 md:grid-cols-3 md:min-h-screen">
      {/* Left: Categories, Search & Text Content */}
      <div className="flex flex-col md:p-0">
        {/* Categories Section */}
        <div className="mb-6 md:mb-8">
          <div className="space-y-1">
            {["MEN", "WOMEN", "KIDS"].map((category) => (
              <p
                key={category}
                className="text-lg tracking-wide text-gray-800 transition cursor-pointer md:text-lg font-extralight hover:text-gray-600"
              >
                {category}
              </p>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 md:mb-12">
          <form
            onSubmit={onSearch}
            className="flex items-center gap-2 px-3 py-2 bg-transparent border border-gray-400 md:gap-3 md:px-4 md:py-3"
          >
            <FiSearch className="w-4 h-4 text-gray-600 md:w-5 md:h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 min-w-0 text-lg text-gray-800 placeholder-gray-500 bg-transparent outline-none md:text-sm"
            />
          </form>
        </div>

        {/* Text Content */}
        <div className="flex flex-col flex-1">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-[-0.04em] text-black/60 [text-shadow:0_0_1px_rgba(0,0,0,0.1)]">
              New Collection
            </h1>
            <h2 className="mt-0 text-lg font-light md:text-xl text-black/60">
              Summer
            </h2>
            <span className="text-black/60">2026</span>
          </div>

          {/* Products Display - Mobile Only with Swipe Carousel */}
          {featuredProducts.length > 0 && (
            <div className="mt-6 md:hidden">
              <ProductCarousel
                products={featuredProducts}
                addToCart={(product: Product) => addToCart(product.id, 1)}
              />
            </div>
          )}

          {/* Go To Shop Button */}
          <div className="flex flex-col gap-3 mt-8 md:mt-32 md:flex-row md:items-center md:gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-32 px-4 py-3 text-lg font-semibold text-gray-800 transition bg-transparent border border-gray-400 font-beatrice hover:text-black group w-fit whitespace-nowrap"
            >
              Go To Shop
              <svg
                width="49"
                height="14"
                viewBox="0 0 49 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.75 6.75H48.25M48.25 6.75L42.25 0.75M48.25 6.75L42.25 12.75"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* Carousel Navigation Controls - Desktop Only */}
            <div className="hidden gap-2 md:flex">
              <button
                onClick={handleCarouselPrev}
                disabled={carouselIndex === 0}
                className={`flex items-center justify-center w-10 h-10 transition border md:w-12 md:h-12 ${
                  carouselIndex === 0
                    ? "border-gray-300 text-gray-300 cursor-not-allowed"
                    : "border-gray-400 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800"
                }`}
                aria-label="Previous products"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={handleCarouselNext}
                disabled={carouselIndex === maxIndex}
                className={`flex items-center justify-center w-10 h-10 transition border md:w-12 md:h-12 ${
                  carouselIndex === maxIndex
                    ? "border-gray-300 text-gray-300 cursor-not-allowed"
                    : "border-gray-400 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800"
                }`}
                aria-label="Next products"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center & Right: Product Carousel - Desktop Only */}
      <div className="hidden md:flex md:col-span-2 md:items-center md:justify-end md:p-8">
        {featuredProducts.length > 0 && (
          <DesktopCarousel
            products={featuredProducts}
            addToCart={(product: Product) => addToCart(product.id, 1)}
            itemsPerView={2}
            currentIndex={carouselIndex}
            onPrev={handleCarouselPrev}
            onNext={handleCarouselNext}
          />
        )}
      </div>
    </section>
  );
};

export default Hero;
