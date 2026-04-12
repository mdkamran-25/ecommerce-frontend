import { useEffect, useState } from "react";
import Head from "next/head";
import * as productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
          page,
          12,
        );
        setProducts(productsData.data);
        setTotalPages(Math.ceil(productsData.pagination?.total / 12) || 1);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
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
      ) : products.length === 0 ? (
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
}
