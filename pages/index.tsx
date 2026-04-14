/**
 * pages/index.tsx
 * Home page with TypeScript (Atomic Design implementation)
 */

import React, { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { CartContext } from "../context/CartContext";
import { productService } from "../services/productService";
import { Product } from "../types";

// Atomic Design Components - Organisms
import NewThisWeekSection from "../components/organisms/NewThisWeekSection";
import CollectionsSection from "../components/organisms/CollectionsSection";
import ApproachSection from "../components/organisms/ApproachSection";
import CTASection from "../components/organisms/CTASection";
import Hero from "../components/Hero";

interface HomeProps {}

export default function Home({}: HomeProps): React.JSX.Element {
  const cartContext = useContext(CartContext);

  // Wrapper function to convert Product to addToCart format
  const handleAddToCart = (product: Product) => {
    if (cartContext?.addToCart) {
      cartContext.addToCart(product.id, 1);
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [newThisWeek, setNewThisWeek] = useState<Product[]>([]);
  const [heroSearchQuery, setHeroSearchQuery] = useState<string>("");

  // Fetch all products on mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch all products
        const response = await productService.getProducts(1, 50);
        setProducts(response.data || []);

        // Set new this week items (first 4 products)
        setNewThisWeek((response.data || []).slice(0, 4));

        // Fetch categories
        try {
          const categoriesResponse = await productService.getCategories();
          const categoriesData = categoriesResponse.data;
          setCategories(categoriesData || []);
        } catch (error) {
          console.log("Categories not available");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on selected category
  const filteredProducts: Product[] =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Handle hero search
  const handleHeroSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      // TODO: Navigate to search results or filter products
      console.log("Search for:", heroSearchQuery);
      setHeroSearchQuery("");
    }
  };

  return (
    <>
      <Head>
        <title>XIV - Modern Fashion Store</title>
        <meta
          name="description"
          content="Discover our curated collection of modern fashion"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="">
        {/* HERO SECTION - NEW COLLECTION */}
        <Hero
          searchQuery={heroSearchQuery}
          onSearchChange={setHeroSearchQuery}
          onSearch={handleHeroSearch}
        >
          {/* Additional Hero Content */}
          <div className="mt-12">
            <Link
              href="/products"
              className="inline-flex items-center gap-24 px-4 py-2 text-lg font-semibold text-gray-800 transition bg-transparent border border-gray-400 font-beatrice hover:text-black group w-fit"
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
            <div className="flex gap-2 mt-4">
              <button className="flex items-center justify-center w-12 h-12 text-gray-800 transition border border-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800">
                <IoIosArrowBack className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-center w-12 h-12 text-gray-800 transition border border-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800">
                <IoIosArrowForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Hero>

        {/* NEW THIS WEEK SECTION */}
        {cartContext && (
          <NewThisWeekSection
            products={newThisWeek}
            addToCart={handleAddToCart}
          />
        )}

        {/* XIV COLLECTIONS SECTION */}
        {cartContext && (
          <CollectionsSection
            products={products}
            loading={loading}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            addToCart={handleAddToCart}
          />
        )}

        {/* OUR APPROACH TO FASHION DESIGN SECTION */}
        <ApproachSection />

        {/* CTA SECTION */}
        <CTASection />

        {/* FOOTER */}
        <footer className="px-6 py-16 text-white bg-black md:px-12">
          <div className="grid grid-cols-1 gap-12 mx-auto mb-12 max-w-7xl md:grid-cols-4">
            {/* Brand */}
            <div>
              <h4 className="mb-4 text-2xl font-black">XIV</h4>
              <p className="text-sm text-gray-400">
                Modern fashion for modern lives
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="mb-4 text-sm font-semibold">SHOP</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/products"
                    className="transition hover:text-white"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="transition hover:text-white"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="transition hover:text-white"
                  >
                    Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h5 className="mb-4 text-sm font-semibold">CUSTOMER SERVICE</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="transition hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="mb-4 text-sm font-semibold">COMPANY</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="transition hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col items-center justify-between text-sm text-gray-400 md:flex-row">
              <p>&copy; 2026 XIV Fashion. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="transition hover:text-white">
                  Instagram
                </a>
                <a href="#" className="transition hover:text-white">
                  Facebook
                </a>
                <a href="#" className="transition hover:text-white">
                  Twitter
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
