
import { supabase } from '@/integrations/supabase/client';

interface StoreRouteData {
  store: any;
  redirectNeeded: boolean;
  finalSlug: string;
}

/**
 * Resolves store routing by checking slug, username, and name fields
 * Returns store data and whether a redirect is needed
 */
export const resolveStoreRoute = async (identifier: string): Promise<StoreRouteData> => {
  const normalizedIdentifier = identifier.toLowerCase();
  
  try {
    // First, try to find by slug (new preferred method)
    let { data: slugData, error: slugError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', normalizedIdentifier)
      .single();
      
    if (slugData && !slugError) {
      console.log('Store found by slug', slugData);
      return { 
        store: slugData, 
        redirectNeeded: false, 
        finalSlug: slugData.slug 
      };
    }
    
    // If not found by slug, try username (legacy support)
    let { data: usernameData, error: usernameError } = await supabase
      .from('stores')
      .select('*')
      .eq('username', normalizedIdentifier)
      .single();
      
    if (usernameData && !usernameError) {
      console.log('Store found by username, redirect needed', usernameData);
      return { 
        store: usernameData, 
        redirectNeeded: true, 
        finalSlug: usernameData.slug || usernameData.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
      };
    }
    
    // Finally, try name field as fallback
    let { data: nameData, error: nameError } = await supabase
      .from('stores')
      .select('*')
      .eq('name', normalizedIdentifier)
      .single();
      
    if (nameData && !nameError) {
      console.log('Store found by name', nameData);
      return { 
        store: nameData, 
        redirectNeeded: false, 
        finalSlug: nameData.slug || nameData.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
      };
    }
    
    throw new Error(`Store "${identifier}" not found`);
  } catch (err) {
    console.error('Exception in store route resolution', err);
    throw err;
  }
};

/**
 * Generates the correct store URL based on the store's slug
 */
export const getStoreUrl = (store: any, path: string = ''): string => {
  const slug = store.slug || store.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
  return `/store/${slug}${path}`;
};

/**
 * Checks if the current URL matches the preferred store URL format
 */
export const shouldRedirectToSlug = (currentIdentifier: string, store: any): boolean => {
  const preferredSlug = store.slug || store.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
  return currentIdentifier.toLowerCase() !== preferredSlug.toLowerCase();
};

/**
 * Generates a redirect path for legacy URLs
 */
export const generateRedirectPath = (currentPath: string, store: any): string => {
  const preferredSlug = store.slug || store.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
  
  // Extract the current store identifier from the path
  const pathParts = currentPath.split('/');
  const storeIndex = pathParts.findIndex(part => part === 'store');
  
  if (storeIndex !== -1 && pathParts[storeIndex + 1]) {
    // Replace the store identifier with the preferred slug
    pathParts[storeIndex + 1] = preferredSlug;
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
    storeSlug: store.slug,
    originalPath: currentPath,
    timestamp: Date.now()
  };
  
  localStorage.setItem('shopzap_store_context', JSON.stringify(storeContext));
  localStorage.setItem('currentStore', store.slug || store.name.toLowerCase());
  localStorage.setItem('lastVisitedStore', store.slug || store.name.toLowerCase());
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
