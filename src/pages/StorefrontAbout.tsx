
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import NotFound from "./NotFound";
import StorefrontAbout from "@/components/storefront/StorefrontAbout";
import StorefrontNavbar from "@/components/storefront/StorefrontNavbar";

const StorefrontAboutPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  
  // Fetch store data using the slug
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-by-slug', storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error('No store slug provided');
      }
      
      console.log('StorefrontAbout: Fetching store with slug', storeSlug);
      
      // Try to find the store using the name field (case-insensitive)
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeSlug)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // Try with URL decoded name (in case of spaces or special characters)
        const decodedStoreSlug = decodeURIComponent(storeSlug);
        console.log('StorefrontAbout: Trying with decoded store slug', decodedStoreSlug);
        
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
        console.error('StorefrontAbout: Error fetching store', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!storeSlug,
  });
  
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
  
  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading store...</p>
      </div>
    );
  }
  
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

  return (
    <div>
      <StorefrontNavbar storeName={store.name} />
      <StorefrontAbout store={store} />
    </div>
  );
};

export default StorefrontAboutPage;
