
import React, { useEffect } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import ProductGrid from "@/components/storefront/ProductGrid";
import StorefrontContent from "@/components/storefront/StorefrontContent";

const Storefront = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();
  
  useEffect(() => {
    console.log('Storefront: Current path', location.pathname);
    console.log('Storefront: Full URL', window.location.href);
    console.log('Storefront: User Agent', navigator.userAgent);
    console.log('Storefront: storeName from params', storeName);
  }, [location, storeName]);
  
  // Fetch store data based on name (not username field anymore)
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', storeName],
    queryFn: async () => {
      console.log('Storefront: Fetching store with name', storeName);
      
      if (!storeName) {
        console.error('Storefront: No store name provided');
        throw new Error('No store name provided');
      }
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('name', storeName)
        .single();
        
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
      console.log('Storefront: Fetching products for store ID', store.id);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
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
        throw err;
      }
    },
    enabled: !!store?.id,
    retry: 3,
    retryDelay: 1000,
  });
  
  // Handle errors and loading states
  useEffect(() => {
    if (storeError) {
      console.error('Storefront: Store error detected', storeError);
    }
    
    if (!storeName) {
      console.error('Storefront: No store name in URL parameters');
    }
  }, [storeError, storeName]);
  
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
  
  // Products error
  if (productsError) {
    console.error('Storefront: Products error', productsError);
  }

  return (
    <StorefrontContent store={store} products={products || []} />
  );
};

export default Storefront;
