
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import StoreNotFound from "@/components/storefront/StoreNotFound";
import StorefrontNavbar from "@/components/storefront/StorefrontNavbar";
import StorefrontAbout from "@/components/storefront/StorefrontAbout";

const StorefrontAboutPage: React.FC = () => {
  const { storeName } = useParams<{ storeName: string }>();
  
  // Fetch store data using the slug
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-by-name', storeName],
    queryFn: async () => {
      if (!storeName) {
        throw new Error('No store name provided');
      }
      
      console.log('StorefrontAbout: Fetching store with name', storeName);
      
      // Try to find the store using the name field (case-insensitive)
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeName)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // Try with URL decoded name (in case of spaces or special characters)
        const decodedStoreName = decodeURIComponent(storeName);
        console.log('StorefrontAbout: Trying with decoded store name', decodedStoreName);
        
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
        console.error('StorefrontAbout: Error fetching store', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!storeName,
  });
  
  if (storeError) {
    return <StoreNotFound storeName={storeName} />;
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
    return <StoreNotFound storeName={storeName} />;
  }

  const socialLinks = {
    instagram: store.theme && typeof store.theme === 'object' ? (store.theme as any).instagram_url : '',
    facebook: store.theme && typeof store.theme === 'object' ? (store.theme as any).facebook_url : '',
    whatsapp: store.theme && typeof store.theme === 'object' ? (store.theme as any).whatsapp_url : ''
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontNavbar storeName={store.name} socialLinks={socialLinks} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <StorefrontAbout store={store} />
        </div>
      </div>
    </div>
  );
};

export default StorefrontAboutPage;
