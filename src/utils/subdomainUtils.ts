
export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Handle root domain cases - these should NOT be treated as subdomains
  if (hostname === 'shopzap.io' || hostname === 'www.shopzap.io') {
    return null;
  }
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  
  // If it's a subdomain setup like store.shopzap.io
  if (parts.length >= 3) {
    const subdomain = parts[0];
    
    // Don't treat 'www' as a valid store subdomain
    if (subdomain === 'www') {
      return null;
    }
    
    return subdomain;
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
