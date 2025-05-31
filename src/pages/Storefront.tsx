
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import ProductGrid from "@/components/storefront/ProductGrid";
import StorefrontContent from "@/components/storefront/StorefrontContent";

const Storefront = () => {
  const { storeName } = useParams<{ storeName: string }>();
  console.log('Storefront: storeName from params', storeName);
  
  // Fetch store data based on name (not username field anymore)
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', storeName],
    queryFn: async () => {
      console.log('Storefront: Fetching store with name', storeName);
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
  });
  
  // Fetch products for the store
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['storeProducts', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!store?.id,
  });
  
  // Show error page if store not found
  if (storeError) {
    return <NotFound />;
  }
  
  // Loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading store...</p>
      </div>
    );
  }
  
  // Store not found (should be caught by error above, but just in case)
  if (!store) {
    return <NotFound />;
  }

  return (
    <StorefrontContent store={store} products={products || []} />
  );
};

export default Storefront;
