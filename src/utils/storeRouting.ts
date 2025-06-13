
import { supabase } from '@/integrations/supabase/client';

interface StoreRouteData {
  store: any;
  redirectNeeded: boolean;
  finalUsername: string;
}

/**
 * Resolves store routing by checking username first, then name as fallback
 * Returns store data and whether a redirect is needed
 */
export const resolveStoreRoute = async (identifier: string): Promise<StoreRouteData> => {
  const normalizedIdentifier = identifier.toLowerCase();
  
  try {
    console.log('Resolving store route for identifier:', normalizedIdentifier);
    
    // First, try to find by username (preferred method - should be exact match)
    let { data: usernameData, error: usernameError } = await supabase
      .from('stores')
      .select('*')
      .eq('username', normalizedIdentifier)
      .maybeSingle();
      
    if (usernameData && !usernameError) {
      console.log('Store found by exact username match:', usernameData);
      return { 
        store: usernameData, 
        redirectNeeded: false, 
        finalUsername: usernameData.username 
      };
    }
    
    // If not found by username, try name field as fallback for legacy support
    let { data: nameData, error: nameError } = await supabase
      .from('stores')
      .select('*')
      .eq('name', normalizedIdentifier)
      .maybeSingle();
      
    if (nameData && !nameError) {
      console.log('Store found by name (legacy), redirect needed:', nameData);
      return { 
        store: nameData, 
        redirectNeeded: true, 
        finalUsername: nameData.username
      };
    }
    
    // Try case-insensitive search on name for more flexibility
    let { data: nameDataInsensitive, error: nameErrorInsensitive } = await supabase
      .from('stores')
      .select('*')
      .ilike('name', normalizedIdentifier)
      .maybeSingle();
      
    if (nameDataInsensitive && !nameErrorInsensitive) {
      console.log('Store found by case-insensitive name match, redirect needed:', nameDataInsensitive);
      return { 
        store: nameDataInsensitive, 
        redirectNeeded: true, 
        finalUsername: nameDataInsensitive.username
      };
    }
    
    console.error('Store not found with identifier:', normalizedIdentifier);
    throw new Error(`Store "${identifier}" not found`);
  } catch (err) {
    console.error('Exception in store route resolution:', err);
    throw err;
  }
};

/**
 * Generates the correct store URL based on the store's username
 */
export const getStoreUrl = (store: any, path: string = '', includeOrigin: boolean = true): string => {
  // Always use the exact username from the database
  const username = store.username;
  const storeUrl = `/store/${username}${path}`;
  
  if (includeOrigin) {
    return `${window.location.origin}${storeUrl}`;
  }
  
  return storeUrl;
};

/**
 * Checks if the current URL matches the preferred store URL format
 */
export const shouldRedirectToUsername = (currentIdentifier: string, store: any): boolean => {
  const preferredUsername = store.username;
  return currentIdentifier.toLowerCase() !== preferredUsername.toLowerCase();
};

/**
 * Generates a redirect path for legacy URLs
 */
export const generateRedirectPath = (currentPath: string, store: any): string => {
  const preferredUsername = store.username;
  
  // Extract the current store identifier from the path
  const pathParts = currentPath.split('/');
  const storeIndex = pathParts.findIndex(part => part === 'store');
  
  if (storeIndex !== -1 && pathParts[storeIndex + 1]) {
    // Replace the store identifier with the preferred username
    pathParts[storeIndex + 1] = preferredUsername;
    return pathParts.join('/');
  }
  
  return currentPath;
};

/**
 * Preserves store context in localStorage for checkout flow
 */
export const preserveStoreContext = (store: any, currentPath: string): void => {
  const storeContext = {
    storeId: store.id,
    storeName: store.name,
    storeUsername: store.username,
    originalPath: currentPath,
    timestamp: Date.now()
  };
  
  localStorage.setItem('shopzap_store_context', JSON.stringify(storeContext));
  localStorage.setItem('currentStore', store.username);
  localStorage.setItem('lastVisitedStore', store.username);
};

/**
 * Retrieves stored store context for checkout flow
 */
export const getStoredStoreContext = (): any => {
  try {
    const contextStr = localStorage.getItem('shopzap_store_context');
    return contextStr ? JSON.parse(contextStr) : null;
  } catch (error) {
    console.error('Error parsing stored store context:', error);
    return null;
  }
};

/**
 * Extract store username from hostname (for subdomain support)
 */
export const extractUsernameFromHostname = (hostname: string): string | null => {
  // Check if it's a subdomain of shopzap.io
  if (hostname.endsWith('.shopzap.io') && hostname !== 'shopzap.io') {
    const subdomain = hostname.replace('.shopzap.io', '');
    return subdomain;
  }
  return null;
};

/**
 * Determine if we're on a subdomain
 */
export const isSubdomain = (): boolean => {
  const hostname = window.location.hostname;
  return hostname.endsWith('.shopzap.io') && hostname !== 'shopzap.io';
};

/**
 * Get the current store context from URL or subdomain
 */
export const getCurrentStoreContext = (): { username: string | null; isSubdomain: boolean } => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Check for subdomain first
  const subdomainUsername = extractUsernameFromHostname(hostname);
  if (subdomainUsername) {
    return { username: subdomainUsername, isSubdomain: true };
  }
  
  // Check for path-based routing
  const pathMatch = pathname.match(/^\/store\/([^\/]+)/);
  if (pathMatch) {
    return { username: pathMatch[1], isSubdomain: false };
  }
  
  return { username: null, isSubdomain: false };
};
