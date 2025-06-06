
import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontContent from "@/components/storefront/StorefrontContent";
import { Tables } from "@/integrations/supabase/types";

const Storefront: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const location = useLocation();
  
  useEffect(() => {
    console.log('Storefront: Current path', location.pathname);
    console.log('Storefront: storeSlug from params', storeSlug);
  }, [location, storeSlug]);
  
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
  
  // Fetch products for the store - only published products
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['storeProducts', store?.id],
    queryFn: async () => {
      console.log('Storefront: Fetching products for store ID', store?.id);
      
      if (!store?.id) {
        console.error('Storefront: No store ID available');
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_published', true)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Storefront: Error fetching products', error);
          throw error;
        }
        
        console.log('Storefront: Products data received', data?.length || 0, 'products');
        return data;
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
      console.log(`Storefront: Final product count for display: ${productCount}`);
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

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products as Tables<'products'>[] : [];
  
  console.log('Storefront: Rendering storefront with product count:', safeProducts.length);

  return (
    <StorefrontContent 
      store={storeWithTheme} 
      products={safeProducts} 
      isLoading={productsLoading}
    />
  );
};

export default Storefront;
