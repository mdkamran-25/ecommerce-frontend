import { useEffect, useState } from "react";
import Head from "next/head";
import * as productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        try {
          const { data: categoriesData } = await productService.getCategories();
          setCategories(categoriesData.data);
        } catch (error) {
          console.log("Categories not available");
        }

        // Fetch products
        const { data: productsData } = await productService.getProducts(
          selectedCategory,
          searchQuery,
        );
        setProducts(productsData.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <Head>
        <title>eCommerce Store - Buy Products Online</title>
        <meta name="description" content="Welcome to our eCommerce store" />
      </Head>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to eCommerce Store</h1>

        <div className="flex gap-4 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field flex-1 min-w-xs"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-600">
          <p>No products found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
