
import React, { useEffect } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontContent from "@/components/storefront/StorefrontContent";
import { Tables } from "@/integrations/supabase/types";

// Reserved paths that should not be treated as store slugs
const RESERVED_PATHS = [
  'auth', 'login', 'signup', 'verify', 'auth-callback',
  'dashboard', 'onboarding', 'store-builder', 'embed-generator',
  'pricing', 'features', 'about', 'privacy', 'terms',
  'order-success', 'track-order', 'order', 'admin'
];

const Storefront: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const location = useLocation();
  
  useEffect(() => {
    console.log('Storefront: Current path', location.pathname);
    console.log('Storefront: storeSlug from params', storeSlug);
  }, [location, storeSlug]);

  // Check if this is a reserved path
  if (storeSlug && RESERVED_PATHS.includes(storeSlug.toLowerCase())) {
    console.log('Storefront: Reserved path detected, redirecting to 404');
    return <NotFound />;
  }
  
  // Fetch store data using the slug
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-by-slug', storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error('No store slug provided');
      }
      
      console.log('Storefront: Fetching store with slug', storeSlug);
      
      // Try to find the store using the name field (case-insensitive)
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeSlug)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // Try with URL decoded name (in case of spaces or special characters)
        const decodedStoreSlug = decodeURIComponent(storeSlug);
        console.log('Storefront: Trying with decoded store slug', decodedStoreSlug);
        
        const secondAttempt = await supabase
          .from('stores')
          .select('*')
          .ilike('name', decodedStoreSlug)
          .single();
          
        if (!secondAttempt.error) {
          return secondAttempt.data;
        }
      }
        
      if (error) {
        console.error('Storefront: Error fetching store', error);
        throw error;
      }
      
      console.log('Storefront: Store data received', data);
      return data;
    },
    enabled: !!storeSlug,
  });
  
  // Fetch products for the store - PUBLIC ACCESS with simplified filtering
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['storeProducts', store?.id],
    queryFn: async () => {
      console.log('Storefront: Fetching PUBLIC products for store ID', store?.id);
      
      if (!store?.id) {
        console.error('Storefront: No store ID available');
        return [];
      }
      
      try {
        // Fetch ALL products for this store first, then filter in JavaScript
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Storefront: Error fetching products', error);
          return [];
        }
        
        console.log('Storefront: ALL products fetched from DB:', data?.length || 0);
        console.log('Storefront: Raw product data:', data);
        
        if (!data || data.length === 0) {
          console.log('Storefront: No products found in database for this store');
          return [];
        }
        
        // Filter products for public display with detailed logging
        const publicProducts = data.filter(product => {
          console.log(`Storefront: Checking product "${product.name}":`, {
            id: product.id,
            status: product.status,
            is_published: product.is_published,
            store_id: product.store_id
          });
          
          // Basic validation
          if (!product || !product.id || !product.name) {
            console.log('Storefront: Product missing basic data:', product);
            return false;
          }
          
          // Check if product belongs to this store
          if (product.store_id !== store.id) {
            console.log('Storefront: Product belongs to different store:', product.store_id, 'vs', store.id);
            return false;
          }
          
          // Only show active products (allow null status to default to active)
          if (product.status && product.status !== 'active') {
            console.log('Storefront: Product not active, status:', product.status);
            return false;
          }
          
          // Show published products (treat null as published by default)
          if (product.is_published === false) {
            console.log('Storefront: Product explicitly unpublished');
            return false;
          }
          
          console.log('Storefront: Product passed all filters:', product.name);
          return true;
        });
        
        console.log('Storefront: Products after filtering for public display:', publicProducts.length);
        console.log('Storefront: Final public products:', publicProducts);
        
        return publicProducts;
      } catch (err) {
        console.error('Storefront: Exception fetching products', err);
        return [];
      }
    },
    enabled: !!store?.id,
    retry: 2,
    retryDelay: 1000,
  });
  
  // Handle errors and loading states
  useEffect(() => {
    if (storeError) {
      console.error('Storefront: Store error detected', storeError);
    }
    
    if (productsError) {
      console.error('Storefront: Products error detected', productsError);
    }
    
    if (!productsLoading) {
      const productCount = products?.length || 0;
      console.log(`Storefront: Final PUBLIC product count for display: ${productCount}`);
      
      if (productCount === 0) {
        console.log('Storefront: No products to display - will show empty state');
      }
    }
  }, [storeError, productsError, productsLoading, products]);
  
  // Show error page if store not found
  if (storeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
        <p className="text-muted-foreground mb-6">The store "{storeSlug}" doesn't exist or is unavailable.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  // Loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading store...</p>
        <p className="mt-2 text-sm text-muted-foreground">Store: {storeSlug}</p>
      </div>
    );
  }
  
  // Store not found (should be caught by error above, but just in case)
  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
        <p className="text-muted-foreground mb-6">The store "{storeSlug}" doesn't exist or is unavailable.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Extract theme data from store.theme if it exists
  const storeWithTheme = {
    ...store,
    primary_color: store.theme && typeof store.theme === 'object' ? (store.theme as any).primary_color || '#6c5ce7' : '#6c5ce7',
    secondary_color: store.theme && typeof store.theme === 'object' ? (store.theme as any).secondary_color || '#a29bfe' : '#a29bfe',
    theme_style: store.theme && typeof store.theme === 'object' ? (store.theme as any).theme_layout || 'card' : 'card',
    font_style: store.font_style || 'Poppins'
  };

  // Ensure products is always an array and show appropriate message if empty
  const safeProducts = Array.isArray(products) ? products as Tables<'products'>[] : [];
  
  console.log('Storefront: Rendering PUBLIC storefront with product count:', safeProducts.length);

  return (
    <StorefrontContent 
      store={storeWithTheme} 
      products={safeProducts} 
      isLoading={productsLoading}
    />
  );
};

export default Storefront;
