
export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  
  // If it's a subdomain setup like store.shopzap.io
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
};

export const isSubdomainRoute = (): boolean => {
  return getSubdomain() !== null;
};

export const generateProductSlug = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

export const parseProductSlug = (slug: string): string => {
  return slug.replace(/-/g, ' ');
};
