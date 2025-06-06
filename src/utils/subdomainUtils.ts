
export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Handle lovable.app domains
  if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    return null;
  }
  
  // Handle main shopzap.io domain
  if (hostname === 'shopzap.io' || hostname === 'www.shopzap.io') {
    return null;
  }
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  
  // If it's a subdomain setup like store.shopzap.io
  if (parts.length >= 3 && parts[parts.length - 2] === 'shopzap' && parts[parts.length - 1] === 'io') {
    return parts[0];
  }
  
  return null;
};

export const isSubdomainRoute = (): boolean => {
  const subdomain = getSubdomain();
  console.log('isSubdomainRoute: hostname =', window.location.hostname);
  console.log('isSubdomainRoute: subdomain =', subdomain);
  return subdomain !== null;
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
