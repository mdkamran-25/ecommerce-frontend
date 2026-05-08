import { useEffect, useState, JSX, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiSearch,
  FiChevronRight,
  FiFilter,
  FiChevronDown,
} from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import { productService } from "../services/productService";
import ProductCard from "../components/molecules/ProductCard";
import { Product, Category } from "../types";
import { CartContext } from "../context/CartContext";

/**
 * ProductsPage - Enhanced with Comprehensive Filters
 */

interface FiltersData {
  sizes: Array<{ value: string; count: number }>;
  colors: Array<{ value: string; count: number }>;
  priceRange: { min: number; max: number };
  availability: {
    inStock: { label: string; count: number };
    outOfStock: { label: string; count: number };
  };
  categories: Array<{ name: string; slug: string; count: number }>;
  ratings: Array<{ rating: number; count: number }>;
}

interface ProductsResponse {
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

const ProductsPage = (): JSX.Element => {
  const router = useRouter();
  const { addToCart } = useContext(CartContext) as any;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFiltersSidebar, setShowFiltersSidebar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Collapsible filter sections
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    size: true,
    availability: true,
    category: false,
    colors: false,
    priceRange: false,
    ratings: false,
  });

  // Filters state
  const [filtersData, setFiltersData] = useState<FiltersData | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [availability, setAvailability] = useState<string>("all"); // all, inStock, outOfStock
  const [chipSort, setChipSort] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch filters on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await productService.getFilters?.();
        console.log("Raw filters response:", response); // Debug log

        // Check if response has valid data
        if (response?.success === true && response?.data) {
          console.log("Using API filters data:", response.data);

          // Ensure sizes array exists and has items
          const sizesData =
            response.data.sizes && response.data.sizes.length > 0
              ? response.data.sizes
              : [
                  { value: "XS", count: 5 },
                  { value: "S", count: 12 },
                  { value: "M", count: 28 },
                  { value: "L", count: 22 },
                  { value: "XL", count: 15 },
                  { value: "XXL", count: 8 },
                ];

          setFiltersData({
            sizes: sizesData,
            colors: response.data.colors || [
              { value: "Black", count: 30 },
              { value: "White", count: 25 },
              { value: "Red", count: 15 },
              { value: "Blue", count: 20 },
              { value: "Green", count: 10 },
            ],
            priceRange: response.data.priceRange || { min: 10, max: 500 },
            availability: response.data.availability || {
              inStock: { label: "In Stock", count: 80 },
              outOfStock: { label: "Out of Stock", count: 20 },
            },
            categories: response.data.categories || [
              { name: "T-Shirt", slug: "t-shirt", count: 45 },
              { name: "Jeans", slug: "jeans", count: 30 },
              { name: "Shoes", slug: "shoes", count: 25 },
            ],
            ratings: response.data.ratings || [
              { rating: 5, count: 50 },
              { rating: 4, count: 30 },
              { rating: 3, count: 15 },
              { rating: 2, count: 3 },
              { rating: 1, count: 2 },
            ],
          });

          if (response.data.priceRange) {
            setPriceRange([
              response.data.priceRange.min,
              response.data.priceRange.max,
            ]);
          } else {
            setPriceRange([10, 500]);
          }
        } else {
          // API returned error or invalid data, use full fallback
          console.warn("Filter API invalid, using complete fallback data");
          setFiltersData({
            sizes: [
              { value: "XS", count: 5 },
              { value: "S", count: 12 },
              { value: "M", count: 28 },
              { value: "L", count: 22 },
              { value: "XL", count: 15 },
              { value: "XXL", count: 8 },
            ],
            colors: [
              { value: "Black", count: 30 },
              { value: "White", count: 25 },
              { value: "Red", count: 15 },
              { value: "Blue", count: 20 },
              { value: "Green", count: 10 },
            ],
            priceRange: { min: 10, max: 500 },
            availability: {
              inStock: { label: "In Stock", count: 80 },
              outOfStock: { label: "Out of Stock", count: 20 },
            },
            categories: [
              { name: "T-Shirt", slug: "t-shirt", count: 45 },
              { name: "Jeans", slug: "jeans", count: 30 },
              { name: "Shoes", slug: "shoes", count: 25 },
            ],
            ratings: [
              { rating: 5, count: 50 },
              { rating: 4, count: 30 },
              { rating: 3, count: 15 },
              { rating: 2, count: 3 },
              { rating: 1, count: 2 },
            ],
          });
          setPriceRange([10, 500]);
        }
      } catch (error) {
        console.error("Failed to fetch filters:", error);
        // Use complete fallback data on error
        setFiltersData({
          sizes: [
            { value: "XS", count: 5 },
            { value: "S", count: 12 },
            { value: "M", count: 28 },
            { value: "L", count: 22 },
            { value: "XL", count: 15 },
            { value: "XXL", count: 8 },
          ],
          colors: [
            { value: "Black", count: 30 },
            { value: "White", count: 25 },
            { value: "Red", count: 15 },
            { value: "Blue", count: 20 },
            { value: "Green", count: 10 },
          ],
          priceRange: { min: 10, max: 500 },
          availability: {
            inStock: { label: "In Stock", count: 80 },
            outOfStock: { label: "Out of Stock", count: 20 },
          },
          categories: [
            { name: "T-Shirt", slug: "t-shirt", count: 45 },
            { name: "Jeans", slug: "jeans", count: 30 },
            { name: "Shoes", slug: "shoes", count: 25 },
          ],
          ratings: [
            { rating: 5, count: 50 },
            { rating: 4, count: 30 },
            { rating: 3, count: 15 },
            { rating: 2, count: 3 },
            { rating: 1, count: 2 },
          ],
        });
        setPriceRange([10, 500]);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params: any = {
          page,
          limit: 12,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedSizes.length > 0) params.sizes = selectedSizes;
        if (selectedColors.length > 0) params.colors = selectedColors;
        if (selectedCategory) params.category = selectedCategory;
        if (priceRange) {
          params.priceMin = priceRange[0];
          params.priceMax = priceRange[1];
        }
        if (availability === "inStock") params.inStock = "true";
        else if (availability === "outOfStock") params.inStock = "false";
        if (chipSort) params.sort = chipSort;
        if (selectedRating) params.minRating = selectedRating;

        const response = await productService.getProducts(page, 12, params);
        const productsData = Array.isArray(response?.data) ? response.data : [];

        // Log first few products to check if images are present
        if (productsData.length > 0) {
          console.log("[FRONTEND PRODUCTS] First product received:", {
            id: productsData[0].id,
            name: productsData[0].name,
            imagesCount: productsData[0].images?.length || 0,
            images: productsData[0].images || [],
          });
        }

        setProducts(productsData);
        const total = response?.pagination?.total || 0;
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / 12) || 1);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    page,
    searchQuery,
    selectedSizes,
    selectedColors,
    selectedCategory,
    priceRange,
    availability,
    selectedRating,
    chipSort,
  ]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  const handleNextPage = (): void => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = (): void => {
    if (page > 1) setPage(page - 1);
  };

  const handleClearFilters = (): void => {
    setSearchQuery("");
    setPage(1);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategory("");
    setSelectedRating(null);
    setPriceRange([
      filtersData?.priceRange.min ?? 0,
      filtersData?.priceRange.max ?? 1000,
    ]);
    setAvailability("all");
    setChipSort(null);
  };

  const toggleFilter = (
    items: string[],
    item: string,
    setItems: (items: string[]) => void,
  ) => {
    setItems(
      items.includes(item) ? items.filter((i) => i !== item) : [...items, item],
    );
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <>
      <Head>
        <title>Products - eCommerce Store</title>
        <meta name="description" content="Browse our product catalog" />
      </Head>

      <div className="flex min-h-screen">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden border-r border-gray-200 w-80 md:block">
          <div className="sticky top-0 h-screen p-6 overflow-y-auto ">
            <h2 className="mb-6 text-lg font-bold">Filters</h2>

            {/* Size Filter - Always Expanded */}
            <div className="pb-6 mb-6 border-b border-gray-200">
              <h3 className="mb-4 text-sm font-semibold">Size</h3>
              <div className="flex flex-wrap gap-2">
                {(filtersData?.sizes && filtersData.sizes.length > 0
                  ? filtersData.sizes
                  : [
                      { value: "XS", count: 5 },
                      { value: "S", count: 12 },
                      { value: "M", count: 28 },
                      { value: "L", count: 22 },
                      { value: "XL", count: 15 },
                      { value: "XXL", count: 8 },
                    ]
                ).map((size) => (
                  <button
                    key={size.value}
                    onClick={() =>
                      toggleFilter(selectedSizes, size.value, setSelectedSizes)
                    }
                    className={`rounded border py-2 px-3 text-xs font-medium transition ${
                      selectedSizes.includes(size.value)
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-800 hover:border-black"
                    }`}
                    title={`${size.count} items`}
                  >
                    {size.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter - Collapsible */}
            <div className="pb-6 mb-6 border-b border-gray-200">
              <button
                onClick={() => toggleSection("availability")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-semibold">Availability</h3>
                <FiChevronDown
                  className={`transition transform ${
                    expandedSections.availability ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
              {expandedSections.availability && (
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === "all"}
                      onChange={() => {
                        setAvailability("all");
                        setPage(1);
                      }}
                      className="rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      All Items{" "}
                      <span className="font-medium text-blue-600">
                        ({filtersData?.availability.inStock.count || 0})
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === "inStock"}
                      onChange={() => {
                        setAvailability("inStock");
                        setPage(1);
                      }}
                      className="rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      In Stock{" "}
                      <span className="font-medium text-blue-600">
                        ({filtersData?.availability.inStock.count || 0})
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === "outOfStock"}
                      onChange={() => {
                        setAvailability("outOfStock");
                        setPage(1);
                      }}
                      className="rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Out of Stock{" "}
                      <span className="font-medium text-blue-600">
                        ({filtersData?.availability.outOfStock.count || 0})
                      </span>
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Categories Filter - Collapsible */}
            <div className="pb-6 mb-6 border-b border-gray-200">
              <button
                onClick={() => toggleSection("category")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-semibold">Category</h3>
                <FiChevronDown
                  className={`transition transform ${
                    expandedSections.category ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
              {expandedSections.category && (
                <div className="space-y-2">
                  {filtersData?.categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setSelectedCategory(
                          selectedCategory === cat.slug ? "" : cat.slug,
                        );
                        setPage(1);
                      }}
                      className={`w-full text-left text-sm py-2 px-3 rounded transition ${
                        selectedCategory === cat.slug
                          ? "bg-black text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{cat.name}</span>
                        <span className="text-xs opacity-70">
                          ({cat.count})
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colors Filter - Collapsible */}
            <div className="pb-6 mb-6 border-b border-gray-200">
              <button
                onClick={() => toggleSection("colors")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-semibold">Colors</h3>
                <FiChevronDown
                  className={`transition transform ${
                    expandedSections.colors ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
              {expandedSections.colors && (
                <div className="space-y-2">
                  {filtersData?.colors.map((color) => (
                    <label
                      key={color.value}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color.value)}
                        onChange={() =>
                          toggleFilter(
                            selectedColors,
                            color.value,
                            setSelectedColors,
                          )
                        }
                        className="rounded cursor-pointer"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                        {color.value}{" "}
                        <span className="font-medium text-blue-600">
                          ({color.count})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Filter - Collapsible */}
            <div className="pb-6 mb-6 border-b border-gray-200">
              <button
                onClick={() => toggleSection("priceRange")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-semibold">Price Range</h3>
                <FiChevronDown
                  className={`transition transform ${
                    expandedSections.priceRange ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
              {expandedSections.priceRange && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">
                      Min: ${priceRange[0]}
                    </label>
                    <input
                      type="range"
                      min={filtersData?.priceRange.min || 0}
                      max={filtersData?.priceRange.max || 1000}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newMin = Number(e.target.value);
                        if (newMin <= priceRange[1]) {
                          setPriceRange([newMin, priceRange[1]]);
                          setPage(1);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Max: ${priceRange[1]}
                    </label>
                    <input
                      type="range"
                      min={filtersData?.priceRange.min || 0}
                      max={filtersData?.priceRange.max || 1000}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newMax = Number(e.target.value);
                        if (newMax >= priceRange[0]) {
                          setPriceRange([priceRange[0], newMax]);
                          setPage(1);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ratings Filter - Collapsible */}
            <div>
              <button
                onClick={() => toggleSection("ratings")}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-semibold">Ratings</h3>
                <FiChevronDown
                  className={`transition transform ${
                    expandedSections.ratings ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
              {expandedSections.ratings && (
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count =
                      filtersData?.ratings.find((r) => r.rating === rating)
                        ?.count || 0;
                    return (
                      <button
                        key={rating}
                        onClick={() => {
                          setSelectedRating(
                            selectedRating === rating ? null : rating,
                          );
                          setPage(1);
                        }}
                        className={`w-full text-left text-sm py-2 px-3 rounded transition flex items-center justify-between ${
                          selectedRating === rating
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {Array(rating)
                            .fill(0)
                            .map((_, i) => (
                              <span key={i} className="text-xs">
                                ⭐
                              </span>
                            ))}
                          {rating} Stars
                        </span>
                        <span className="text-xs opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Filters Sidebar */}
        {showFiltersSidebar && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setShowFiltersSidebar(false)}
            />
            <aside className="fixed top-0 left-0 z-40 h-screen p-6 overflow-y-auto border-r border-gray-200 w-72">
              <button
                onClick={() => setShowFiltersSidebar(false)}
                className="flex items-center gap-2 mb-6 text-sm font-semibold"
              >
                <IoIosArrowBack className="w-5 h-5" />
                Back
              </button>

              {/* Size Filter - Always Expanded */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <h3 className="mb-4 text-sm font-semibold">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {filtersData?.sizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() =>
                        toggleFilter(
                          selectedSizes,
                          size.value,
                          setSelectedSizes,
                        )
                      }
                      className={`rounded border py-2 px-3 text-xs font-medium transition ${
                        selectedSizes.includes(size.value)
                          ? "border-black bg-black text-white"
                          : "border-gray-300 text-gray-800 hover:border-black"
                      }`}
                      title={`${size.count} items`}
                    >
                      {size.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter - Collapsible */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <button
                  onClick={() => toggleSection("availability")}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-sm font-semibold">Availability</h3>
                  <FiChevronDown
                    className={`transition transform ${
                      expandedSections.availability ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
                {expandedSections.availability && (
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="availability-mobile"
                        checked={availability === "all"}
                        onChange={() => {
                          setAvailability("all");
                          setPage(1);
                        }}
                        className="rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        All Items{" "}
                        <span className="font-medium text-blue-600">
                          ({filtersData?.availability.inStock.count || 0})
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="availability-mobile"
                        checked={availability === "inStock"}
                        onChange={() => {
                          setAvailability("inStock");
                          setPage(1);
                        }}
                        className="rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        In Stock{" "}
                        <span className="font-medium text-blue-600">
                          ({filtersData?.availability.inStock.count || 0})
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="availability-mobile"
                        checked={availability === "outOfStock"}
                        onChange={() => {
                          setAvailability("outOfStock");
                          setPage(1);
                        }}
                        className="rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Out of Stock{" "}
                        <span className="font-medium text-blue-600">
                          ({filtersData?.availability.outOfStock.count || 0})
                        </span>
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Categories Filter - Collapsible */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <button
                  onClick={() => toggleSection("category")}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-sm font-semibold">Category</h3>
                  <FiChevronDown
                    className={`transition transform ${
                      expandedSections.category ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
                {expandedSections.category && (
                  <div className="space-y-2">
                    {filtersData?.categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setSelectedCategory(
                            selectedCategory === cat.slug ? "" : cat.slug,
                          );
                          setPage(1);
                        }}
                        className={`w-full text-left text-sm py-2 px-3 rounded transition ${
                          selectedCategory === cat.slug
                            ? "bg-black text-white font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{cat.name}</span>
                          <span className="text-xs opacity-70">
                            ({cat.count})
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors Filter - Collapsible */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <button
                  onClick={() => toggleSection("colors")}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-sm font-semibold">Colors</h3>
                  <FiChevronDown
                    className={`transition transform ${
                      expandedSections.colors ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
                {expandedSections.colors && (
                  <div className="space-y-2">
                    {filtersData?.colors.map((color) => (
                      <label
                        key={color.value}
                        className="flex items-center cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color.value)}
                          onChange={() =>
                            toggleFilter(
                              selectedColors,
                              color.value,
                              setSelectedColors,
                            )
                          }
                          className="rounded cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                          {color.value}{" "}
                          <span className="font-medium text-blue-600">
                            ({color.count})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Filter - Collapsible */}
              <div className="pb-6 mb-6 border-b border-gray-200">
                <button
                  onClick={() => toggleSection("priceRange")}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-sm font-semibold">Price Range</h3>
                  <FiChevronDown
                    className={`transition transform ${
                      expandedSections.priceRange ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
                {expandedSections.priceRange && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600">
                        Min: ${priceRange[0]}
                      </label>
                      <input
                        type="range"
                        min={filtersData?.priceRange.min || 0}
                        max={filtersData?.priceRange.max || 1000}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = Number(e.target.value);
                          if (newMin <= priceRange[1]) {
                            setPriceRange([newMin, priceRange[1]]);
                            setPage(1);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        Max: ${priceRange[1]}
                      </label>
                      <input
                        type="range"
                        min={filtersData?.priceRange.min || 0}
                        max={filtersData?.priceRange.max || 1000}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = Number(e.target.value);
                          if (newMax >= priceRange[0]) {
                            setPriceRange([priceRange[0], newMax]);
                            setPage(1);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ratings Filter - Collapsible */}
              <div>
                <button
                  onClick={() => toggleSection("ratings")}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-sm font-semibold">Ratings</h3>
                  <FiChevronDown
                    className={`transition transform ${
                      expandedSections.ratings ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
                {expandedSections.ratings && (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count =
                        filtersData?.ratings.find((r) => r.rating === rating)
                          ?.count || 0;
                      return (
                        <button
                          key={rating}
                          onClick={() => {
                            setSelectedRating(
                              selectedRating === rating ? null : rating,
                            );
                            setPage(1);
                          }}
                          className={`w-full text-left text-sm py-2 px-3 rounded transition flex items-center justify-between ${
                            selectedRating === rating
                              ? "bg-black text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {Array(rating)
                              .fill(0)
                              .map((_, i) => (
                                <span key={i} className="text-xs">
                                  ⭐
                                </span>
                              ))}
                            {rating} Stars
                          </span>
                          <span className="text-xs opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {/* Header with Search */}
          <div className="p-4 border-b border-gray-200 md:p-8">
            {/* Breadcrumb */}
            <nav className="mb-2 text-sm text-gray-500">
              <Link href="/">Home</Link>
              <span className="px-2">/</span>
              <span className="font-medium">Products</span>
            </nav>

            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold md:text-3xl">PRODUCTS</h1>
                <button
                  onClick={() => setShowFiltersSidebar(true)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded md:hidden"
                >
                  <FiFilter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Search + Chips Row */}
              <div className="flex flex-col gap-3 mt-4 md:flex-row md:items-center">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center flex-1 gap-2 px-3 py-2 bg-transparent border border-gray-400 md:gap-3 md:px-4 md:py-3"
                >
                  <FiSearch className="w-4 h-4 text-gray-600 md:w-5 md:h-5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-0 text-lg text-gray-800 placeholder-gray-500 bg-transparent outline-none md:text-sm"
                  />
                  <button type="submit" className="sr-only">
                    Search
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center px-4 py-3 text-sm font-light tracking-wide text-gray-500 uppercase bg-transparent border border-gray-500 hover:border-gray-500 hover:text-gray-700"
                >
                  Clear Filter
                </button>

                {/* Chips - desktop */}
                <div className="hidden md:flex md:items-center md:gap-2 md:ml-4">
                  {[
                    {
                      label: "New",
                      action: () => {
                        setChipSort("new");
                        setSelectedCategory("");
                        setPage(1);
                      },
                    },
                    {
                      label: "Shirts",
                      action: () => {
                        setChipSort(null);
                        setSelectedCategory("t-shirt");
                        setPage(1);
                      },
                    },
                    {
                      label: "Jeans",
                      action: () => {
                        setChipSort(null);
                        setSelectedCategory("jeans");
                        setPage(1);
                      },
                    },
                    {
                      label: "Best Sellers",
                      action: () => {
                        setChipSort("best");
                        setSelectedCategory("");
                        setPage(1);
                      },
                    },
                    {
                      label: "Jackets",
                      action: () => {
                        setChipSort(null);
                        setSelectedCategory("jackets");
                        setPage(1);
                      },
                    },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={chip.action}
                      className={`whitespace-nowrap px-4 py-3 text-sm rounded border transition ${
                        (chip.label === "New" && chipSort === "new") ||
                        (chip.label === "Best Sellers" &&
                          chipSort === "best") ||
                        (chip.label !== "New" &&
                          chip.label !== "Best Sellers" &&
                          selectedCategory &&
                          selectedCategory ===
                            (chip.label === "Shirts"
                              ? "t-shirt"
                              : chip.label.toLowerCase()))
                          ? "bg-black text-white border-black"
                          : " text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Chips - mobile (below search) */}
                <div className="flex gap-2 mt-2 overflow-x-auto md:hidden">
                  {[
                    {
                      label: "New",
                      action: () => {
                        setChipSort("new");
                        setSelectedCategory("");
                        setPage(1);
                      },
                    },
                    {
                      label: "Shirts",
                      action: () => {
                        setChipSort(null);
                        setSelectedCategory("t-shirt");
                        setPage(1);
                      },
                    },
                    {
                      label: "Jeans",
                      action: () => {
                        setChipSort(null);
                        setSelectedCategory("jeans");
                        setPage(1);
                      },
                    },
                    {
                      label: "Best Sellers",
                      action: () => {
                        setChipSort("best");
                        setSelectedCategory("");
                        setPage(1);
                      },
                    },
                    {
                      label: "Jackets",
                      action: () => {
                        setChipSort(null);
                        setSelectedCategory("jackets");
                        setPage(1);
                      },
                    },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={chip.action}
                      className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded whitespace-nowrap hover:bg-gray-100"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="p-4 md:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">No products found</div>
              </div>
            ) : (
              <>
                {/* Products Count */}
                <div className="mb-6 text-sm text-gray-600">
                  Showing {products.length} of{" "}
                  <span className="font-semibold">{totalProducts}</span>{" "}
                  products
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      addToCart={() => addToCart(product.id, 1)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-6 py-3 font-medium border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="px-6 py-3 font-medium text-white bg-black rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ProductsPage;
