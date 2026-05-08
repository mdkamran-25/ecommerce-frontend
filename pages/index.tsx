/**
 * pages/index.tsx
 * Home page with TypeScript (Atomic Design implementation)
 */

import React, { useEffect, useState, useContext } from "react";
import Head from "next/head";
import { CartContext } from "../context/CartContext";
import { productService } from "../services/productService";
import { Product } from "../types";

// Atomic Design Components - Organisms
import NewThisWeekSection from "../components/organisms/NewThisWeekSection";
import CollectionsSection from "../components/organisms/CollectionsSection";
import ApproachSection from "../components/organisms/ApproachSection";
import Footer from "../components/organisms/Footer";
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

  const CATEGORY_ALIASES: Record<string, string[]> = {
    ALL: [],
    Men: ["men", "mens", "men's"],
    Women: ["women", "womens", "women's"],
    KID: ["kid", "kids", "kid's", "children"],
  };

  const getCategoryValue = (product: Product): string => {
    const category = product.category;

    if (typeof category === "string") {
      return category.toLowerCase();
    }

    return (category?.slug || category?.name || "").toLowerCase();
  };

  // Fetch all products on mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch all products
        const response = await productService.getProducts(1, 100);
        const allProducts = response.data || [];
        setProducts(allProducts);

        // Set new this week items (all products)
        setNewThisWeek(allProducts);

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
      : products.filter((p) => {
          const categoryValue = getCategoryValue(p);
          const allowedValues = CATEGORY_ALIASES[selectedCategory] || [
            selectedCategory.toLowerCase(),
          ];

          return allowedValues.some((value) => categoryValue === value);
        });

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

      <div className="flex flex-col w-full">
        {/* HERO SECTION - NEW COLLECTION - Order 1 */}
        <div className="order-1">
          <Hero
            searchQuery={heroSearchQuery}
            onSearchChange={setHeroSearchQuery}
            onSearch={handleHeroSearch}
            featuredProducts={products}
          />
        </div>

        {/* NEW THIS WEEK SECTION - Order 2 on Mobile, stays natural order on Desktop */}
        {cartContext && (
          <div className="order-2">
            <NewThisWeekSection
              products={newThisWeek}
              addToCart={handleAddToCart}
              totalCount={newThisWeek.length}
            />
          </div>
        )}

        {/* XIV COLLECTIONS SECTION - Order 3 */}
        {cartContext && (
          <div className="order-3">
            <CollectionsSection
              products={products}
              loading={loading}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              addToCart={handleAddToCart}
            />
          </div>
        )}

        {/* OUR APPROACH TO FASHION DESIGN SECTION - Order 4 */}
        <div className="order-4">
          <ApproachSection />
        </div>

        {/* FOOTER - Order 5 */}
        <div className="order-5">
          <Footer />
        </div>
      </div>
    </>
  );
}
