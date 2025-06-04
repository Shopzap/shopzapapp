
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontAbout from "@/components/storefront/StorefrontAbout";
import StorefrontNavbar from "@/components/storefront/StorefrontNavbar";

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

  return (
    <div>
      <StorefrontNavbar storeName={store.name} />
      <StorefrontAbout store={store} />
    </div>
  );
};

export default StorefrontAboutPage;
