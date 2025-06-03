
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontAbout from "@/components/storefront/StorefrontAbout";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

const StorefrontAboutPage = () => {
  const { storeName } = useParams<{ storeName: string }>();
  
  // Fetch store data
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store', storeName],
    queryFn: async () => {
      if (!storeName) {
        throw new Error('No store name provided');
      }
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeName)
        .single();
        
      if (error && error.code === 'PGRST116') {
        const decodedStoreName = decodeURIComponent(storeName);
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
        throw error;
      }
      return data;
    },
    enabled: !!storeName,
  });
  
  if (storeError) {
    return <NotFound />;
  }
  
  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading store...</p>
      </div>
    );
  }
  
  if (!store) {
    return <NotFound />;
  }

  // Extract theme data from store.theme if it exists
  const storeWithTheme = {
    ...store,
    primary_color: store.theme && typeof store.theme === 'object' ? (store.theme as any).primary_color || '#6c5ce7' : '#6c5ce7',
    secondary_color: store.theme && typeof store.theme === 'object' ? (store.theme as any).secondary_color || '#a29bfe' : '#a29bfe',
    theme_style: store.theme && typeof store.theme === 'object' ? (store.theme as any).theme_layout || 'card' : 'card'
  };

  return (
    <div>
      <StorefrontHeader
        store={storeWithTheme}
        productCount={0}
        viewMode="grid"
        onViewModeChange={() => {}}
        sortBy="newest"
        onSortChange={() => {}}
        showFilters={false}
        onToggleFilters={() => {}}
        cartItemCount={0}
      />
      <StorefrontAbout store={store} />
    </div>
  );
};

export default StorefrontAboutPage;
