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
import WishlistButton from "../../components/WishlistButton";

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
 * Review stars component and helpers
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await addToCart(product?.id, quantity, selectedSize, selectedColor);
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

      <div className="min-h-screen px-4 py-0 text-slate-900 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-6 text-sm font-medium tracking-wide transition text-slate-600 hover:text-slate-900"
            aria-label="Go back"
          >
            <svg
              width="61"
              height="14"
              viewBox="0 0 61 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60.25 6.75H0.75M0.75 6.75L6.75 0.75M0.75 6.75L6.75 12.75"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.9fr] lg:items-start">
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

                <WishlistButton productId={String(product.id)} size="lg" />
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

          {/* Reviews Section - aligned with main page container for consistent padding */}
          <div className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>

            {ratingStats && (
              <div
                className="grid"
                style={{ gridTemplateColumns: "200px 1fr", gap: "1rem" }}
              >
                <div className="mb-6 p-6 bg-slate-50 rounded-md text-center">
                  <div className="text-4xl font-bold mb-2">
                    {ratingStats.averageRating.toFixed(1)}
                  </div>
                  <RatingStars
                    rating={Math.round(ratingStats.averageRating)}
                    size="1.5rem"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    {ratingStats.totalReviews} review
                    {ratingStats.totalReviews !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="mb-6 p-6 bg-slate-50 rounded-md">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-4 mb-2">
                      <div className="w-8 text-right">{stars}★</div>
                      <div className="w-56 h-2 bg-slate-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{
                            width:
                              ratingStats.totalReviews > 0
                                ? `${(ratingStats.ratingDistribution[stars] / ratingStats.totalReviews) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">
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
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Write a Review
              </button>
            )}

            {!user && (
              <p className="mb-6 text-slate-600">
                <Link href="/auth/login">
                  <span className="text-blue-600 cursor-pointer">Sign in</span>
                </Link>{" "}
                to write a review
              </p>
            )}

            {showReviewForm && user && (
              <form
                onSubmit={handleSubmitReview}
                className="mb-6 p-6 bg-slate-50 rounded border border-slate-200"
              >
                <h3 className="mb-4">
                  {userReview ? "Update Your Review" : "Share Your Review"}
                </h3>

                {reviewError && (
                  <div className="p-4 mb-4 bg-red-50 text-red-700 rounded">
                    {reviewError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block mb-2">Rating: </label>
                  <div className="mb-2">
                    <RatingStars rating={parseInt(String(reviewForm.rating))} />
                  </div>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, rating: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Good</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Poor</option>
                    <option value="1">1 Star - Terrible</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Review Title *</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, title: e.target.value })
                    }
                    placeholder="What's your main impression?"
                    maxLength={100}
                    required
                    className="w-full p-3 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2">
                    Review Comment * (minimum 10 characters)
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    placeholder="Share your experience with this product..."
                    rows={5}
                    required
                    className="w-full p-3 border rounded font-sans"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewError("");
                      if (!userReview)
                        setReviewForm({ rating: 5, title: "", comment: "" });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loadingReviews ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="pb-6 mb-4 border-b border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold mb-1">
                          {review.user?.firstName} {review.user?.lastName}
                        </p>
                        <RatingStars rating={review.rating} />
                      </div>
                      {user?.userId === review.userId && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <p className="font-bold mb-2">{review.title}</p>

                    <p className="text-slate-600 leading-7 mb-2">
                      {review.content}
                    </p>

                    <p className="text-sm text-slate-400">
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
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
