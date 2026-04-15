/**
 * Product Detail Page
 * Displays detailed product information, images, reviews, and add-to-cart functionality
 */

import { useRouter } from "next/router";
import { useEffect, useState, useContext, FC } from "react";
import Head from "next/head";
import NextLink from "next/link";
import productService from "../../services/productService";
import reviewService from "../../services/reviewService";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { Product } from "../../types";
import { toast } from "react-toastify";

/**
 * Review interface
 */
interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  userId: string;
  user?: { firstName: string; lastName: string };
}

/**
 * Rating stats interface
 */
interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

/**
 * Review form interface
 */
interface ReviewForm {
  rating: number | string;
  title: string;
  comment: string;
}

/**
 * ProductDetail - Product detail page with reviews section
 */
const ProductDetail: FC = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { user } = useContext(AuthContext) as any;
  const { addToCart } = useContext(CartContext) as any;

  // Product states
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  /**
   * Fetch product details
   */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await productService.getProduct(id);
        setProduct(response.data);

        fetchReviews();
        fetchRatingStats();
        if (user) {
          fetchUserReview();
        }
      } catch (error) {
        setError("Failed to load product details");
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  /**
   * Fetch product reviews
   */
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const { data } = await (reviewService as any).getProductReviews(id);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  /**
   * Fetch rating statistics
   */
  const fetchRatingStats = async () => {
    try {
      const { data } = await (reviewService as any).getProductStats(id);
      setRatingStats(data);
    } catch (error) {
      console.error("Failed to fetch rating stats:", error);
    }
  };

  /**
   * Fetch user's review if exists
   */
  const fetchUserReview = async () => {
    try {
      const { data } = await (reviewService as any).getUserProductReview(id);
      if (data) {
        setUserReview(data);
        setReviewForm({
          rating: data.rating,
          title: data.title,
          comment: data.content || "",
        });
      }
    } catch (error) {
      console.log("User has no review yet");
    }
  };

  /**
   * Handle review submission
   */
  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      setReviewError("Title and comment are required");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      await (reviewService as any).createReview(id, {
        rating: parseInt(String(reviewForm.rating)),
        title: reviewForm.title,
        comment: reviewForm.comment,
      });

      fetchReviews();
      fetchRatingStats();
      fetchUserReview();

      setReviewForm({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      toast.success("Review submitted successfully!");
    } catch (error: any) {
      setReviewError(error.error || error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  /**
   * Handle review deletion
   */
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await (reviewService as any).deleteReview(reviewId);
      fetchReviews();
      fetchRatingStats();
      setUserReview(null);
      toast.success("Review deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete review: " + (error.error || error.message));
    }
  };

  /**
   * Rating stars component
   */
  const RatingStars: FC<{ rating: number; size?: string }> = ({
    rating,
    size = "1rem",
  }) => {
    return (
      <span style={{ fontSize: size, letterSpacing: "2px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ color: i <= rating ? "#ffc107" : "#ddd" }}>
            ★
          </span>
        ))}
      </span>
    );
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (quantity < 1 || quantity > (product?.stock || 0)) {
      setError("Invalid quantity");
      return;
    }

    try {
      setAdding(true);
      setError("");
      await addToCart(product?.id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
      setQuantity(1);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="error">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - eCommerce Store</title>
        <meta name="description" content={product.description} />
      </Head>

      <button
        onClick={() => router.back()}
        style={{ marginBottom: "1rem", backgroundColor: "#6c757d" }}
      >
        ← Back
      </button>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "400px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              No image available
            </div>
          )}

          {product.images && product.images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name}-${idx}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1>{product.name}</h1>

          {product.compareAt && (
            <p
              style={{
                color: "#999",
                textDecoration: "line-through",
                marginBottom: "0.5rem",
              }}
            >
              ₹{product.compareAt}
            </p>
          )}

          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#28a745",
              marginBottom: "1rem",
            }}
          >
            ₹{product.price}
          </p>

          <p style={{ marginBottom: "1rem", color: "#666" }}>
            <strong>Stock:</strong> {product.stock} items available
          </p>

          {product.category && (
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              <strong>Category:</strong>{" "}
              {typeof product.category === "string"
                ? product.category
                : product.category?.name}
            </p>
          )}

          {product.sku && (
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              <strong>SKU:</strong> {product.sku}
            </p>
          )}

          <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            Description
          </h3>
          <p
            style={{ color: "#666", lineHeight: "1.6", marginBottom: "1.5rem" }}
          >
            {product.description}
          </p>

          {error && <div className="error">{error}</div>}

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Quantity:
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                max={product.stock}
                style={{ width: "100px" }}
              />
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1.1rem",
              backgroundColor: product.stock === 0 ? "#ccc" : "#28a745",
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
            }}
          >
            {adding
              ? "Adding to cart..."
              : product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
          </button>

          {product.variants && product.variants.length > 0 && (
            <>
              <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                Variants
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "0.9rem" }}>{variant.type}</p>
                    <p style={{ fontWeight: "bold" }}>{variant.value}</p>
                    <p style={{ fontSize: "0.85rem", color: "#666" }}>
                      Stock: {variant.stock}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div
        style={{
          marginTop: "3rem",
          borderTop: "1px solid #ddd",
          paddingTop: "2rem",
        }}
      >
        <h2>Customer Reviews</h2>

        {ratingStats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: "2rem",
              marginBottom: "2rem",
              padding: "1.5rem",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {ratingStats.averageRating.toFixed(1)}
              </div>
              <RatingStars
                rating={Math.round(ratingStats.averageRating)}
                size="1.5rem"
              />
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginTop: "0.5rem",
                }}
              >
                {ratingStats.totalReviews} review
                {ratingStats.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            <div>
              {[5, 4, 3, 2, 1].map((stars) => (
                <div
                  key={stars}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div style={{ width: "30px", textAlign: "right" }}>
                    {stars}★
                  </div>
                  <div
                    style={{
                      width: "200px",
                      height: "8px",
                      backgroundColor: "#ddd",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: "#ffc107",
                        width:
                          ratingStats.totalReviews > 0
                            ? `${(ratingStats.ratingDistribution[stars] / ratingStats.totalReviews) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    {ratingStats.ratingDistribution[stars]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && !showReviewForm && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            style={{
              marginBottom: "2rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Write a Review
          </button>
        )}

        {!user && (
          <p style={{ marginBottom: "2rem", color: "#666" }}>
            <NextLink href="/auth/login">
              <span style={{ color: "#007bff", cursor: "pointer" }}>
                Sign in
              </span>
            </NextLink>{" "}
            to write a review
          </p>
        )}

        {showReviewForm && user && (
          <form
            onSubmit={handleSubmitReview}
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>
              {userReview ? "Update Your Review" : "Share Your Review"}
            </h3>

            {reviewError && (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                {reviewError}
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Rating:{" "}
                <RatingStars rating={parseInt(String(reviewForm.rating))} />
              </label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, rating: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Terrible</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Review Title *
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, title: e.target.value })
                }
                placeholder="What's your main impression?"
                maxLength={100}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Review Comment * (minimum 10 characters)
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                placeholder="Share your experience with this product..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: submittingReview ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  opacity: submittingReview ? 0.6 : 1,
                }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewError("");
                  if (!userReview) {
                    setReviewForm({ rating: 5, title: "", comment: "" });
                  }
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loadingReviews ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div>
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid #ddd",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                      {review.user?.firstName} {review.user?.lastName}
                    </p>
                    <RatingStars rating={review.rating} />
                  </div>
                  {user?.userId === review.userId && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p style={{ fontWeight: "bold", margin: "0.75rem 0 0.5rem 0" }}>
                  {review.title}
                </p>

                <p
                  style={{
                    color: "#666",
                    lineHeight: "1.6",
                    marginBottom: "0.5rem",
                  }}
                >
                  {review.content}
                </p>

                <p style={{ fontSize: "0.85rem", color: "#999" }}>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
