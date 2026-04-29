/**
 * components/Hero.tsx
 * Hero section component (TypeScript)
 */

import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
}) => {
  return (
    <section className="grid min-h-screen grid-cols-1 gap-0 md:grid-cols-3">
      {/* Left: Categories, Search & Text Content */}
      <div className="flex flex-col p-4 md:p-0">
        {/* Categories Section */}
        <div className="mb-6 md:mb-8">
          <div
            className="space-y-1"
            style={{
              fontFamily:
                "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            {["MEN", "WOMEN", "KIDS"].map((category) => (
              <p
                key={category}
                className="text-xs tracking-wide text-gray-800 transition cursor-pointer md:text-sm font-extralight hover:text-gray-600"
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
              className="flex-1 min-w-0 text-xs text-gray-800 placeholder-gray-500 bg-transparent outline-none md:text-sm"
            />
          </form>
        </div>

        {/* Text Content */}
        <div className="flex flex-col flex-1">
          <div>
            <h1
              className="text-3xl md:text-6xl font-extrabold uppercase leading-none tracking-[-0.04em] text-black/60 [text-shadow:0_0_1px_rgba(0,0,0,0.1)]"
              style={{
                fontFamily:
                  "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              New Collection
            </h1>
            <h2
              className="mt-0 text-lg font-light md:text-xl text-black/60"
              style={{
                fontFamily:
                  "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              Summer
            </h2>
            <span
              className="text-black/60"
              style={{
                fontFamily:
                  "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              2026
            </span>
          </div>

          {/* Go To Shop Button & Carousel Controls */}
          <div className="flex flex-col gap-3 mt-8 md:mt-32 md:flex-row md:items-center md:gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-24 px-4 py-3 text-lg font-semibold text-gray-800 transition bg-transparent border border-gray-400 font-beatrice hover:text-black group w-fit whitespace-nowrap"
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

            {/* Carousel Controls */}
            <div className="flex gap-2 ml-auto md:ml-auto">
              <button className="flex items-center justify-center w-10 h-10 text-gray-800 transition border border-gray-400 md:w-12 md:h-12 hover:bg-gray-800 hover:text-white hover:border-gray-800">
                <IoIosArrowBack className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="flex items-center justify-center w-10 h-10 text-gray-800 transition border border-gray-400 md:w-12 md:h-12 hover:bg-gray-800 hover:text-white hover:border-gray-800">
                <IoIosArrowForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center & Right: Perfect Square Images Grid - Hidden on Mobile */}
      <div className="items-center justify-end hidden col-span-2 gap-8 md:flex">
        <div className="shrink-0">
          <img
            src="/img/Homepageimage1.png"
            alt="Featured Collection"
            className="object-cover h-96 w-96"
          />
        </div>
        <div className="shrink-0">
          <img
            src="/img/HomepageImage2.png"
            alt="Featured Product"
            className="object-cover w-96 h-96"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
