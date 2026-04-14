import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { CartContext } from "../context/CartContext";
import * as productService from "../services/productService";

export default function Home() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [newThisWeek, setNewThisWeek] = useState([]);

  // Fetch all products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all products
        const { data: productsData } = await productService.getProducts(1, 50);
        setProducts(productsData.data || []);

        // Set new this week items (first 4 products)
        setNewThisWeek((productsData.data || []).slice(0, 4));

        // Fetch categories
        try {
          const { data: categoriesData } = await productService.getCategories();
          setCategories(categoriesData.data || []);
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
  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      <Head>
        <title>XIV - Modern Fashion Store</title>
        <meta
          name="description"
          content="Discover our curated collection of modern fashion"
        />
      </Head>

      <div className="">
        {/* HERO SECTION - NEW COLLECTION */}
        <section className="grid min-h-screen grid-cols-1 gap-0 md:grid-cols-3">
          {/* Left: Categories, Search & Text Content */}
          <div className="flex flex-col px-0 py-0 md:px-0">
            {/* Categories Section */}
            <div className="mb-8">
              <h3 className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Categories
              </h3>
              <div className="space-y-2">
                {["MEN", "WOMEN", "KIDS"].map((category) => (
                  <p
                    key={category}
                    className="text-sm font-medium tracking-wide text-gray-800 transition cursor-pointer hover:text-gray-600"
                  >
                    {category}
                  </p>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-12">
              <div className="flex items-center overflow-hidden bg-white border border-gray-300 rounded-lg">
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-500 bg-transparent outline-none"
                />
                <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* NEW COLLECTION - Main Content */}
            <div>
              <h2 className="mb-4 text-5xl font-black leading-tight md:text-6xl font-beatrice">
                NEW
                <br />
                COLLECTION
              </h2>
              <p className="mb-8 text-base font-light text-gray-700">
                Summer 2024
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-4 text-lg font-semibold text-gray-800 transition hover:text-black group w-fit"
                >
                  Go To Shop
                  <svg
                    className="w-6 h-6 transition group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>

                {/* Carousel Controls */}
                <div className="flex gap-3">
                  <button className="flex items-center justify-center w-10 h-10 text-gray-800 transition border-2 border-gray-400 rounded hover:bg-gray-800 hover:text-white hover:border-gray-800">
                    ‹
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 text-gray-800 transition border-2 border-gray-400 rounded hover:bg-gray-800 hover:text-white hover:border-gray-800">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Middle and Right: Images Container */}
          <div className="flex items-center justify-center gap-8 px-6 py-12 md:col-span-2">
            {/* Middle: First Product Image (White/Light) */}
            <div className="relative flex items-center justify-center flex-1 overflow-hidden bg-white aspect-square">
              <img
                src="/img/HomepageImage1.png"
                alt="Collection showcase"
                className="object-cover w-full h-full"
              />
            </div>

            {/* Right: Second Product Image (Dark) */}
            <div className="flex items-center justify-center flex-1 overflow-hidden bg-white aspect-square">
              <img
                src="/img/Homepageimage2.png"
                alt="Collection showcase"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* NEW THIS WEEK SECTION */}
        <section className="px-6 py-16 md:px-12">
          <div className="mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-12">
              <h3 className="text-4xl font-black md:text-5xl">
                NEW
                <br />
                THIS WEEK
                <span className="ml-2 text-xl text-blue-600">(SO)</span>
              </h3>
              <Link
                href="/products"
                className="text-sm font-medium text-gray-600 underline transition hover:text-gray-800"
              >
                See all
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newThisWeek.map((product) => (
                <div key={product.id} className="cursor-pointer group">
                  <div className="mb-4 overflow-hidden bg-gray-100 rounded aspect-square">
                    <img
                      src={
                        product.image || "https://via.placeholder.com/300x300"
                      }
                      alt={product.name}
                      className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <h4 className="mb-2 text-sm font-semibold text-gray-800 transition group-hover:text-gray-600">
                      {product.name}
                    </h4>
                  </Link>
                  <p className="mb-4 text-sm text-gray-600">
                    ${product.price?.toFixed(2) || "0.00"}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full px-4 py-2 text-sm font-medium text-white transition bg-gray-800 rounded hover:bg-gray-900"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-12">
              <button className="flex items-center justify-center w-8 h-8 text-gray-400">
                ←
              </button>
              {[1, 2].map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-semibold transition ${
                    page === 1
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="flex items-center justify-center w-8 h-8 text-gray-400">
                →
              </button>
            </div>
          </div>
        </section>

        {/* XIV COLLECTIONS SECTION */}
        <section className="px-6 py-16 bg-white md:px-12">
          <div className="mx-auto max-w-7xl">
            {/* Section Header with Filters */}
            <div className="flex items-end justify-between mb-12">
              <h3 className="text-4xl font-black md:text-5xl">
                XIV
                <br />
                COLLECTIONS
                <br />
                23-24
              </h3>

              {/* Category Filters */}
              <div className="flex gap-6 text-sm">
                {["ALL", "Men", "Women", "EKO"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() =>
                      setSelectedCategory(
                        filter === "ALL" ? "ALL" : filter.toLowerCase(),
                      )
                    }
                    className={`font-semibold transition ${
                      selectedCategory === filter
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-12 text-center text-gray-600">
                Loading products...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.slice(0, 9).map((product) => (
                  <div key={product.id} className="group">
                    <div className="mb-4 overflow-hidden bg-gray-100 rounded aspect-square">
                      <img
                        src={
                          product.image || "https://via.placeholder.com/400x400"
                        }
                        alt={product.name}
                        className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <Link href={`/products/${product.id}`}>
                      <h4 className="mb-2 text-base font-semibold text-gray-800 transition group-hover:text-gray-600">
                        {product.name}
                      </h4>
                    </Link>
                    <p className="font-semibold text-gray-700">
                      $ {product.price?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            <div className="mt-12 text-center">
              <button className="text-sm font-semibold text-gray-600 transition hover:text-gray-900">
                Load more
              </button>
            </div>
          </div>
        </section>

        {/* OUR APPROACH TO FASHION DESIGN SECTION */}
        <section className="px-6 py-20 md:px-12 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <h3 className="mb-8 text-4xl font-black text-center md:text-5xl">
              OUR APPROACH TO FASHION DESIGN
            </h3>

            {/* Description */}
            <p className="max-w-2xl mx-auto mb-16 leading-relaxed text-center text-gray-700">
              at elegant vogue, we blend creativity with craftsmanship to create
              fashion that transcends trends. each fashion that transcends
              trends. each piece is meticulously crafted, ensuring the highest
              quality design is meticulously crafted, ensuring the highest
              quality and exquisite finish.
            </p>

            {/* Mood Board Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { title: "Elegance", color: "bg-blue-100" },
                { title: "Heritage", color: "bg-gray-200" },
                { title: "Innovation", color: "bg-gray-100" },
                { title: "Craftsmanship", color: "bg-yellow-50" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded ${item.color} flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition`}
                >
                  <div className="text-center">
                    <p className="font-semibold text-gray-700">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-6 py-20 text-white bg-gray-900 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="mb-6 text-4xl font-black md:text-5xl">
              DISCOVER MORE
            </h3>
            <p className="max-w-xl mx-auto mb-8 text-gray-300">
              Explore our full collection and find your perfect piece
            </p>
            <Link
              href="/products"
              className="inline-block px-12 py-4 font-bold text-gray-900 transition bg-white rounded hover:bg-gray-100"
            >
              Browse Collection
            </Link>
          </div>
        </section>

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
              <p>&copy; 2024 XIV Fashion. All rights reserved.</p>
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
