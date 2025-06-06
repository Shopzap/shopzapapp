
// Utility functions for the new path-based routing system

// Reserved paths that should not be treated as store slugs
export const RESERVED_PATHS = [
  'auth', 'login', 'signup', 'verify', 'auth-callback',
  'dashboard', 'onboarding', 'store-builder', 'embed-generator',
  'pricing', 'features', 'about', 'privacy', 'terms',
  'order-success', 'track-order', 'order', 'admin'
];

/**
 * Check if a path is reserved and should not be treated as a store slug
 */
export const isReservedPath = (path: string): boolean => {
  return RESERVED_PATHS.includes(path.toLowerCase());
};

/**
 * Convert a product name to a URL-friendly slug
 */
export const createProductSlug = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

/**
 * Convert a URL slug back to a searchable product name
 */
export const slugToProductName = (slug: string): string => {
  return slug.replace(/-/g, ' ');
};

/**
 * Generate store-specific URLs
 */
export const generateStoreUrls = (storeSlug: string) => ({
  storefront: `/${storeSlug}`,
  about: `/${storeSlug}/about`,
  cart: `/${storeSlug}/cart`,
  checkout: `/${storeSlug}/checkout`,
  product: (productSlug: string) => `/${storeSlug}/${productSlug}`,
});

/**
 * Check if current URL is a store-specific route
 */
export const isStoreRoute = (pathname: string): boolean => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return false;
  
  const firstSegment = segments[0];
  return !isReservedPath(firstSegment);
};

/**
 * Extract store slug from pathname
 */
export const extractStoreSlug = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  
  const firstSegment = segments[0];
  return isReservedPath(firstSegment) ? null : firstSegment;
};
