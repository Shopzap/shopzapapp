
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import ProductGrid from "@/components/storefront/ProductGrid";

const Storefront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  
  // Fetch store data based on slug
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', storeSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('username', storeSlug)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!storeSlug,
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
    <div className="min-h-screen bg-background">
      <StorefrontHeader store={store} />
      <main className="container mx-auto px-4 py-8">
        {productsLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Our Products</h2>
            <ProductGrid products={products} />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No products available yet.</p>
          </div>
        )}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {store.name}. Powered by ShopZap.</p>
      </footer>
    </div>
  );
};

export default Storefront;
