
// Utility functions for generating and handling slugs

/**
 * Generate a URL-friendly slug from text
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique product slug within a store
 */
export const generateUniqueProductSlug = async (
  storeName: string, 
  productName: string, 
  supabase: any, 
  excludeProductId?: string
): Promise<string> => {
  const baseSlug = createSlug(productName);
  let slug = baseSlug;
  let counter = 1;

  // Get store ID first
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('username', storeName)
    .maybeSingle();

  if (!store) {
    return slug;
  }

  while (true) {
    // Check if slug exists in this store
    let query = supabase
      .from('products')
      .select('id')
      .eq('store_id', store.id)
      .eq('slug', slug);

    if (excludeProductId) {
      query = query.neq('id', excludeProductId);
    }

    const { data: existingProduct } = await query.maybeSingle();

    if (!existingProduct) {
      return slug;
    }

    // If slug exists, try with counter
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

/**
 * Generate a clean store username (NO SUFFIXES - exactly as entered)
 */
export const createStoreUsername = (storeName: string): string => {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '') // Remove all special characters and spaces
    .substring(0, 50); // Limit length to reasonable size
};
