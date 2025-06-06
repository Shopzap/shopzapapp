
export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  console.log('getSubdomain: hostname =', hostname);
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('getSubdomain: localhost detected, returning null');
    return null;
  }
  
  // Handle lovable.app domains (main app domains)
  if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    console.log('getSubdomain: lovable domain detected, returning null');
    return null;
  }
  
  // Handle main shopzap.io domain
  if (hostname === 'shopzap.io' || hostname === 'www.shopzap.io') {
    console.log('getSubdomain: main shopzap domain detected, returning null');
    return null;
  }
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  console.log('getSubdomain: hostname parts =', parts);
  
  // If it's a subdomain setup like store.shopzap.io
  if (parts.length >= 3 && parts[parts.length - 2] === 'shopzap' && parts[parts.length - 1] === 'io') {
    const subdomain = parts[0];
    console.log('getSubdomain: shopzap subdomain detected =', subdomain);
    return subdomain;
  }
  
  console.log('getSubdomain: no subdomain detected, returning null');
  return null;
};

export const isSubdomainRoute = (): boolean => {
  const subdomain = getSubdomain();
  console.log('isSubdomainRoute: hostname =', window.location.hostname);
  console.log('isSubdomainRoute: subdomain =', subdomain);
  const isSubdomain = subdomain !== null;
  console.log('isSubdomainRoute: result =', isSubdomain);
  return isSubdomain;
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
