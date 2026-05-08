/**
 * imagekit.ts - ImageKit URL optimization utilities
 * Provides functions to optimize ImageKit URLs for different display contexts
 */

const IMAGEKIT_BASE = "https://ik.imagekit.io/navbharatlabs/";

/**
 * Optimize ImageKit URL for product display
 * Adds transformation parameters for responsive quality and sizing
 *
 * @param url - Original ImageKit URL
 * @param context - Display context (thumbnail, card, detail, hero)
 * @returns Optimized URL with transformation parameters
 */
export const optimizeImageKitUrl = (
  url: string,
  context: "thumbnail" | "card" | "detail" | "hero" = "card",
): string => {
  if (!url) return url;

  // If URL doesn't have transformation parameters, add them
  if (!url.includes("/tr:")) {
    // Map contexts to transformation parameters
    const transformations: Record<string, string> = {
      // Thumbnail: small, optimized for grid
      thumbnail: "tr:w-300,h-300,c-at_max,q-100,f-auto",
      // Card: medium, product grid cards
      card: "tr:w-600,h-800,c-at_max,q-100,f-auto",
      // Detail: large, product detail page
      detail: "tr:w-1200,h-1600,c-at_max,q-100,f-auto",
      // Hero: full width, hero section
      hero: "tr:w-1600,h-1000,c-at_max,q-100,f-auto",
    };

    const transformation = transformations[context] || transformations.card;

    // Insert transformation after domain
    if (url.includes(IMAGEKIT_BASE)) {
      return url.replace(IMAGEKIT_BASE, `${IMAGEKIT_BASE}${transformation}/`);
    }
  }

  return url;
};

/**
 * Get responsive image URLs for Next.js Image component
 * Returns srcSet-compatible URLs for different viewport sizes
 *
 * @param url - Original ImageKit URL
 * @returns Object with URLs for different sizes
 */
export const getResponsiveImageUrls = (url: string) => {
  if (!url) return { small: "", medium: "", large: "" };

  return {
    small: optimizeImageKitUrl(url, "thumbnail"),
    medium: optimizeImageKitUrl(url, "card"),
    large: optimizeImageKitUrl(url, "detail"),
  };
};

export default {
  optimizeImageKitUrl,
  getResponsiveImageUrls,
};
