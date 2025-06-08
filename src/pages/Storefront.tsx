
import React, { useEffect } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import ModernStorefront from "@/components/storefront/ModernStorefront";
import StoreNotFound from "@/components/storefront/StoreNotFound";
import { Tables } from "@/integrations/supabase/types";
import { COLOR_PALETTES } from "@/components/storefront/ColorPaletteSelector";

const Storefront: React.FC = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    console.log('Storefront: Current path', location.pathname);
    console.log('Storefront: storeName from params', storeName);
  }, [location, storeName]);

  // Redirect to home if no store name provided
  if (!storeName || storeName.trim() === '') {
    console.error('Storefront: No store name provided in URL');
    return <Navigate to="/" replace />;
  }
  
  // Fetch store data with proper error handling and customization data
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-by-name', storeName],
    queryFn: async () => {
      console.log('Storefront: Fetching store data for', storeName);
      
      try {
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
          
          const { data: decodedData, error: decodedError } = await supabase
            .from('stores')
            .select('*')
            .ilike('name', decodedStoreName)
            .single();
            
          if (decodedError) {
            console.error('Storefront: Store not found after decode attempt', decodedError);
            throw new Error(`Store "${storeName}" not found`);
          }
          
          console.log('Storefront: Store found with decoded name', decodedData);
          return decodedData;
        }
          
        if (error) {
          console.error('Storefront: Error fetching store', error);
          throw new Error(`Store "${storeName}" not found`);
        }
        
        console.log('Storefront: Store data received with theme:', data?.theme);
        return data;
      } catch (err) {
        console.error('Storefront: Exception in store fetch', err);
        throw err;
      }
    },
    enabled: !!storeName,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30 * 1000, // Reduced from 5 minutes to 30 seconds for faster updates
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch products for the store with proper filtering
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['storeProducts', store?.id],
    queryFn: async () => {
      console.log('Storefront: Fetching products for store ID', store?.id);
      
      if (!store?.id) {
        console.log('Storefront: No store ID available, returning empty array');
        return [];
      }
      
      try {
        // Fetch active and published products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('status', 'active')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Storefront: Error fetching products', error);
          throw error;
        }
        
        console.log('Storefront: Products data received', data?.length || 0, 'published products');
        return data || [];
      } catch (err) {
        console.error('Storefront: Exception fetching products', err);
        return [];
      }
    },
    enabled: !!store?.id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle errors and loading states
  useEffect(() => {
    if (storeError) {
      console.error('Storefront: Store error detected', storeError);
    }
    
    if (productsError) {
      console.error('Storefront: Products error detected', productsError);
    }
    
    if (!productsLoading && products) {
      console.log(`Storefront: Final product count for display: ${products.length}`);
    }
  }, [storeError, productsError, productsLoading, products]);

  // Invalidate cache when returning from customization
  useEffect(() => {
    const handleFocus = () => {
      console.log('Storefront: Window focused, invalidating store cache for fresh data');
      queryClient.invalidateQueries({ queryKey: ['store-by-name', storeName] });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient, storeName]);
  
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

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products as Tables<'products'>[] : [];
  
  // Process theme data with enhanced color system
  const themeData = store.theme && typeof store.theme === 'object' ? store.theme as any : {};
  console.log('Storefront: Processing theme data:', themeData);

  // Get color palette for fallbacks
  const colorPaletteId = themeData.color_palette || 'urban-modern';
  const selectedPalette = COLOR_PALETTES.find(p => p.id === colorPaletteId) || COLOR_PALETTES[0];
  
  // Enhanced store object with properly mapped colors
  const enhancedStore = {
    ...store,
    // Use the new clear color system with proper fallbacks
    primaryColor: themeData.primaryColor || selectedPalette.primary,
    textColor: themeData.textColor || '#F9FAFB',
    buttonColor: themeData.buttonColor || selectedPalette.cta,
    buttonTextColor: themeData.buttonTextColor || '#FFFFFF',
    accentColor: themeData.accentColor || selectedPalette.accent,
    font_style: store.font_style || themeData.font_style || 'Poppins',
    theme: {
      ...themeData,
      // Ensure theme object has the mapped colors too
      primaryColor: themeData.primaryColor || selectedPalette.primary,
      textColor: themeData.textColor || '#F9FAFB',
      buttonColor: themeData.buttonColor || selectedPalette.cta,
      buttonTextColor: themeData.buttonTextColor || '#FFFFFF',
      accentColor: themeData.accentColor || selectedPalette.accent,
      color_palette: colorPaletteId,
      font_style: store.font_style || themeData.font_style || 'Poppins',
      instagram_url: themeData.instagram_url || '',
      facebook_url: themeData.facebook_url || '',
      whatsapp_url: themeData.whatsapp_url || ''
    }
  };
  
  console.log('Storefront: Enhanced store with applied customization:', {
    name: enhancedStore.name,
    productCount: safeProducts.length,
    storeId: enhancedStore.id,
    customizationApplied: {
      primary: enhancedStore.primaryColor,
      text: enhancedStore.textColor,
      button: enhancedStore.buttonColor,
      buttonText: enhancedStore.buttonTextColor,
      accent: enhancedStore.accentColor,
      font: enhancedStore.font_style
    }
  });

  return (
    <ModernStorefront 
      store={enhancedStore} 
      products={safeProducts} 
      isLoading={productsLoading}
    />
  );
};

export default Storefront;
