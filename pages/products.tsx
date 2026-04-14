import { useEffect, useState, JSX } from "react";
import Head from "next/head";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { Product, Category } from "../types";

/**
 * ProductsPage
 * Displays all products with filtering by category and search functionality
 * Includes pagination support
 */

interface ProductsResponse {
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

interface CategoriesResponse {
  data: Category[];
}

const ProductsPage = (): JSX.Element => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        try {
          const categoriesResponse = await productService.getCategories();
          if (categoriesResponse?.data) {
            setCategories(
              Array.isArray(categoriesResponse.data)
                ? categoriesResponse.data
                : [],
            );
          }
        } catch (error) {
          console.log("Categories not available");
          setCategories([]);
        }

        // Fetch products
        const productsResponse = await productService.getProducts(page, 12, {
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
        });

        setProducts(
          Array.isArray(productsResponse?.data) ? productsResponse.data : [],
        );
        setTotalPages(
          Math.ceil((productsResponse?.pagination?.total || 0) / 12) || 1,
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery, page]);

  /**
   * Handle next page pagination
   */
  const handleNextPage = (): void => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  /**
   * Handle previous page pagination
   */
  const handlePrevPage = (): void => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <Head>
        <title>Products - eCommerce Store</title>
        <meta name="description" content="Browse our product catalog" />
      </Head>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>All Products</h1>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{ flex: 1, minWidth: "250px" }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
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
      ) : !products || products.length === 0 ? (
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p>No products found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              style={{ backgroundColor: page === 1 ? "#ccc" : "#007bff" }}
            >
              ← Previous
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
              }}
            >
              <span>
                Page {page} of {totalPages}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              style={{
                backgroundColor: page === totalPages ? "#ccc" : "#007bff",
              }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default ProductsPage;
