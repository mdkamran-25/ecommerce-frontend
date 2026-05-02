/**
 * Product Detail Page
 * Displays detailed product information, images, reviews, and add-to-cart functionality
 */

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState, useContext, FC } from "react";
import Head from "next/head";
import productService from "../../services/productService";
import reviewService from "../../services/reviewService";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { Product } from "../../types";
import { toast } from "react-toastify";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const colorSwatches: Record<string, string> = {
  black: "#111111",
  white: "#f8f8f8",
  gray: "#8d8d8d",
  grey: "#8d8d8d",
  silver: "#c0c0c0",
  red: "#d64545",
  blue: "#4f7cff",
  green: "#3fa56b",
  yellow: "#f0c94d",
  orange: "#f28c3a",
  purple: "#8b6cff",
  pink: "#f07eb4",
  brown: "#8b5a2b",
  beige: "#e8d8b8",
  navy: "#1e3a5f",
  teal: "#41bfb3",
};

const getSwatchColor = (value: string) => {
  const key = value.toLowerCase().trim();
  return colorSwatches[key] || "#d1d5db";
};

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
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

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

  useEffect(() => {
    if (!product) return;

    setSelectedImage(product.images?.[0] || "");

    const sizeVariant = product.variants?.find(
      (variant) => variant.type === "size",
    );
    setSelectedSize(sizeVariant?.value || "");

    const colorVariant = product.variants?.find(
      (variant) => variant.type === "color",
    );
    setSelectedColor(colorVariant?.value || "");
  }, [product?.id]);

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

  const galleryImages = product.images || [];
  const sizeVariants =
    product.variants?.filter((variant) => variant.type === "size") || [];
  const colorVariants =
    product.variants?.filter((variant) => variant.type === "color") || [];
  const capacityVariants =
    product.variants?.filter((variant) => variant.type === "capacity") || [];
  const mainImage = selectedImage || galleryImages[0] || "";

  return (
    <>
      <Head>
        <title>{product.name} - eCommerce Store</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_38%),linear-gradient(180deg,#f7f7f4_0%,#f0f0ed_100%)] px-4 py-4 text-slate-900 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-6 text-sm font-medium tracking-wide transition text-slate-600 hover:text-slate-900"
          >
            <span className="text-lg">←</span>
            Back
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_88px_0.9fr] lg:items-start">
            <section className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_80px] lg:gap-4">
              <div className="overflow-hidden border border-slate-200 bg-white/80 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="object-cover object-center w-full h-135 md:h-155"
                  />
                ) : (
                  <div className="flex items-center justify-center text-sm h-135 bg-slate-100 text-slate-500 md:h-155">
                    No image available
                  </div>
                )}
              </div>

              <div className="flex gap-3 pb-1 overflow-x-auto lg:mt-0 lg:flex-col lg:overflow-visible lg:pb-0">
                {galleryImages.length > 0 ? (
                  galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden border bg-white transition lg:h-20 lg:w-20 ${
                        selectedImage === image
                          ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center border border-dashed border-slate-300 text-[11px] text-slate-400">
                    No photos
                  </div>
                )}
              </div>
            </section>

            <aside className="hidden lg:block">
              <div className="w-10 h-10 mx-auto rotate-45 border border-slate-900 bg-slate-900" />
            </aside>

            <section className="border border-slate-200 bg-white/85 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8 lg:sticky lg:top-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-slate-500">
                    {typeof product.category === "string"
                      ? product.category
                      : product.category?.name || "Collection"}
                  </p>
                  <h1 className="max-w-md text-2xl font-semibold uppercase tracking-[0.18em] md:text-3xl">
                    {product.name}
                  </h1>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center justify-center w-10 h-10 transition border border-slate-300 text-slate-500 hover:border-slate-900 hover:text-slate-900"
                  aria-label="Save product"
                >
                  ♡
                </button>
              </div>

              <div className="mb-6 space-y-1">
                {product.compareAt ? (
                  <p className="text-sm line-through text-slate-400">
                    {currency.format(product.compareAt)}
                  </p>
                ) : null}
                <p className="text-2xl font-semibold">
                  {currency.format(product.price)}
                </p>
                <p className="text-sm text-slate-500">MRP incl. of all taxes</p>
              </div>

              <p className="mb-6 max-w-xl text-sm leading-6 text-slate-700 md:text-[15px]">
                {product.description}
              </p>

              <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-500">
                <span>{product.stock > 0 ? "In stock" : "Out of stock"}</span>
                <span className="w-8 h-px bg-slate-300" />
                <span>{product.stock} available</span>
              </div>

              {colorVariants.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-[0.28em] text-slate-500">
                      Color
                    </h3>
                    {selectedColor ? (
                      <span className="text-xs text-slate-600">
                        {selectedColor}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorVariants.map((variant) => {
                      const selected = selectedColor === variant.value;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          title={`${variant.value} (${variant.stock} left)`}
                          onClick={() => setSelectedColor(variant.value)}
                          className={`h-10 w-10 border transition ${
                            selected
                              ? "scale-105 border-slate-900 ring-2 ring-slate-900 ring-offset-2"
                              : "border-slate-200 hover:border-slate-500"
                          }`}
                          style={{
                            backgroundColor: getSwatchColor(variant.value),
                          }}
                        >
                          <span className="sr-only">{variant.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sizeVariants.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-[0.28em] text-slate-500">
                      Size
                    </h3>
                    <div className="text-xs text-slate-500">
                      <button type="button" className="hover:text-slate-900">
                        Find your size
                      </button>
                      <span className="mx-2">|</span>
                      <button type="button" className="hover:text-slate-900">
                        Measurement guide
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeVariants.map((variant) => {
                      const selected = selectedSize === variant.value;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedSize(variant.value)}
                          className={`min-w-10 border px-3 py-2 text-xs uppercase tracking-[0.22em] transition ${
                            selected
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-900"
                          }`}
                        >
                          {variant.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {capacityVariants.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">
                    Capacity
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {capacityVariants.map((variant) => (
                      <span
                        key={variant.id}
                        className="border border-slate-300 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-700"
                      >
                        {variant.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-2 mb-6 text-sm text-slate-600 md:grid-cols-2">
                {product.sku ? (
                  <div>
                    <span className="font-medium text-slate-900">SKU:</span>{" "}
                    {product.sku}
                  </div>
                ) : null}
                {product.vendor ? (
                  <div>
                    <span className="font-medium text-slate-900">Vendor:</span>{" "}
                    {product.vendor}
                  </div>
                ) : null}
                {product.weight ? (
                  <div>
                    <span className="font-medium text-slate-900">Weight:</span>{" "}
                    {product.weight} kg
                  </div>
                ) : null}
                {product.dimensions ? (
                  <div>
                    <span className="font-medium text-slate-900">
                      Dimensions:
                    </span>{" "}
                    {product.dimensions}
                  </div>
                ) : null}
              </div>

              {error && (
                <div className="px-4 py-3 mb-4 text-sm text-red-700 border border-red-200 bg-red-50">
                  {error}
                </div>
              )}

              <div className="flex items-end gap-4 mb-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-500">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    max={product.stock}
                    className="w-24 px-3 py-2 text-sm transition bg-white border outline-none border-slate-300 focus:border-slate-900"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="flex-1 border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {adding
                    ? "Adding..."
                    : product.stock === 0
                      ? "Out of Stock"
                      : "Add"}
                </button>
              </div>

              {(selectedSize || selectedColor) && (
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Selected: {selectedSize ? `Size ${selectedSize}` : ""}
                  {selectedSize && selectedColor ? " · " : ""}
                  {selectedColor ? `Color ${selectedColor}` : ""}
                </div>
              )}
            </section>
          </div>
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
            <Link href="/auth/login">
              <span style={{ color: "#007bff", cursor: "pointer" }}>
                Sign in
              </span>
            </Link>{" "}
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
