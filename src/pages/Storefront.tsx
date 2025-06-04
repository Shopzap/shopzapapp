
import React, { useEffect } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontContent from "@/components/storefront/StorefrontContent";
import { Tables } from "@/integrations/supabase/types";

const Storefront = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();
  
  useEffect(() => {
    console.log('Storefront: Current path', location.pathname);
    console.log('Storefront: storeName from params', storeName);
  }, [location, storeName]);
  
  // Fetch store data based on name
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', storeName],
    queryFn: async () => {
      console.log('Storefront: Fetching store with name', storeName);
      
      if (!storeName) {
        console.error('Storefront: No store name provided');
        throw new Error('No store name provided');
      }
      
      // Try to find the store with case-insensitive matching
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeName)
        .single();
        
      // If no store found, try with URL decoded name (in case of spaces or special characters)
      if (error && error.code === 'PGRST116') {
        const decodedStoreName = decodeURIComponent(storeName);
        console.log('Storefront: Trying with decoded store name', decodedStoreName);
        
        const secondAttempt = await supabase
          .from('stores')
          .select('*')
          .ilike('name', decodedStoreName)
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
    enabled: !!storeName,
    retry: 3,
    retryDelay: 1000,
  });
  
  // Fetch products for the store
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
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Storefront: Error fetching products', error);
          // Don't throw error, return empty array instead
          return [];
        }
        
        console.log('Storefront: Products data received', data?.length || 0, 'products');
        console.log('Storefront: Raw products data', data);
        
        // Ensure data is properly formatted
        const validProducts = (data || []).filter(product => 
          product && 
          product.id && 
          product.name && 
          typeof product.price !== 'undefined'
        );
        
        console.log('Storefront: Valid products after filtering', validProducts.length);
        return validProducts;
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
    
    if (!productsLoading && (!products || products.length === 0)) {
      console.log('Storefront: No products found or still loading');
    }
  }, [storeError, productsError, productsLoading, products]);
  
  // Show error page if store not found
  if (storeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
        <p className="text-muted-foreground mb-6">The store you're looking for doesn't exist or is unavailable.</p>
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
        <p className="mt-2 text-sm text-muted-foreground">Store: {storeName}</p>
      </div>
    );
  }
  
  // Store not found (should be caught by error above, but just in case)
  if (!store) {
    return <NotFound />;
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

  return (
    <StorefrontContent 
      store={storeWithTheme} 
      products={safeProducts} 
      isLoading={productsLoading}
    />
  );
};

export default Storefront;
