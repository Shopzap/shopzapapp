
export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  console.log('subdomainUtils: Current hostname:', hostname);

  // Development environment
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    console.log('subdomainUtils: Development environment, no subdomain');
    return null;
  }

  // Check if it's the root domain
  if (hostname === 'shopzap.io' || hostname === 'www.shopzap.io') {
    console.log('subdomainUtils: Root domain detected, no subdomain');
    return null;
  }

  // Extract subdomain from hostname like "dore.shopzap.io"
  const parts = hostname.split('.');
  
  if (parts.length >= 3) {
    const subdomain = parts[0];
    console.log('subdomainUtils: Subdomain detected:', subdomain);
    return subdomain;
  }

  console.log('subdomainUtils: No subdomain found');
  return null;
};

export const isSubdomain = (): boolean => {
  return getSubdomain() !== null;
};
