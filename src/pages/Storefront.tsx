
import React, { useEffect } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import StorefrontContent from "@/components/storefront/StorefrontContent";
import StoreNotFound from "@/components/storefront/StoreNotFound";
import { Tables } from "@/integrations/supabase/types";

const Storefront: React.FC = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();
  
  useEffect(() => {
    console.log('Storefront: Current path', location.pathname);
    console.log('Storefront: storeName from params', storeName);
  }, [location, storeName]);

  // Redirect to home if no store name provided
  if (!storeName || storeName.trim() === '') {
    console.error('Storefront: No store name provided in URL');
    return <Navigate to="/" replace />;
  }
  
  // Fetch store data using the store name
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-by-name', storeName],
    queryFn: async () => {
      console.log('Storefront: Fetching store with name', storeName);
      
      // Try to find the store using the name field (case-insensitive)
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeName)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // Try with URL decoded name (in case of spaces or special characters)
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
    retry: 2,
    retryDelay: 1000,
  });
  
  // Fetch products for the store - only published products
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['storeProducts', store?.id],
    queryFn: async () => {
      console.log('Storefront: Fetching products for store ID', store?.id);
      
      if (!store?.id) {
        console.log('Storefront: No store ID available, returning empty array');
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
        return data || [];
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
    console.error('Storefront: Rendering error page due to store error');
    return <StoreNotFound storeName={storeName} />;
  }
  
  // Loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">Loading store...</p>
        <p className="text-gray-500 text-sm mt-2">Store: {storeName}</p>
      </div>
    );
  }
  
  // Store not found (should be caught by error above, but just in case)
  if (!store) {
    console.error('Storefront: No store data available');
    return <StoreNotFound storeName={storeName} />;
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
