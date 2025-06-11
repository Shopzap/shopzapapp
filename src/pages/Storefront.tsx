
import React, { useEffect } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ModernStorefront from "@/components/storefront/ModernStorefront";
import StoreNotFound from "@/components/storefront/StoreNotFound";
import StorefrontLoader from "@/components/storefront/StorefrontLoader";
import ProductGridSkeleton from "@/components/storefront/ProductGridSkeleton";
import { useStoreCache, preloadCriticalResources } from "@/components/storefront/StoreCacheManager";
import { Tables } from "@/integrations/supabase/types";
import { COLOR_PALETTES } from "@/components/storefront/ColorPaletteSelector";

const Storefront: React.FC = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { getCachedData, setCachedData } = useStoreCache(storeName || '');
  
  // Preload critical resources on component mount
  useEffect(() => {
    preloadCriticalResources();
  }, []);

  useEffect(() => {
    console.log('Storefront: Current path', location.pathname);
    console.log('Storefront: storeName from params', storeName);
  }, [location, storeName]);

  // Normalize the store name to lowercase for consistent querying
  const normalizedStoreName = storeName?.toLowerCase();

  // Redirect to home if no store name provided
  if (!storeName || storeName.trim() === '') {
    console.error('Storefront: No store name provided in URL');
    return <Navigate to="/" replace />;
  }

  // Check cache first
  const cachedData = getCachedData(storeName);
  
  // Fetch store data with improved error handling and query logic
  const { data: storeData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-lookup', normalizedStoreName],
    queryFn: async () => {
      console.log('Storefront: Fetching store data for identifier', normalizedStoreName);
      
      try {
        // First, try to find by slug (new preferred method)
        let { data: slugData, error: slugError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', normalizedStoreName)
          .maybeSingle();
          
        if (slugData && !slugError) {
          console.log('Storefront: Store found by slug', slugData);
          return { store: slugData, redirectNeeded: false };
        }
        
        // If not found by slug, try username (legacy support) with proper escaping
        console.log('Storefront: Trying with username field', normalizedStoreName);
        let { data: usernameData, error: usernameError } = await supabase
          .from('stores')
          .select('*')
          .eq('username', normalizedStoreName)
          .maybeSingle();
          
        if (usernameData && !usernameError) {
          console.log('Storefront: Store found by username', usernameData);
          return { store: usernameData, redirectNeeded: false };
        }
        
        // Finally, try name field as fallback using textSearch instead of ilike
        console.log('Storefront: Trying with name field using textSearch', normalizedStoreName);
        let { data: nameData, error: nameError } = await supabase
          .from('stores')
          .select('*')
          .textSearch('name', normalizedStoreName)
          .maybeSingle();
          
        if (nameData && !nameError) {
          console.log('Storefront: Store found by name', nameData);
          return { store: nameData, redirectNeeded: false };
        }
        
        // Last attempt: direct name equality check
        console.log('Storefront: Final attempt with direct name match', normalizedStoreName);
        let { data: directData, error: directError } = await supabase
          .from('stores')
          .select('*')
          .eq('name', normalizedStoreName)
          .maybeSingle();
          
        if (directData && !directError) {
          console.log('Storefront: Store found by direct name match', directData);
          return { store: directData, redirectNeeded: false };
        }
        
        console.error('Storefront: Store not found with any identifier', normalizedStoreName);
        throw new Error(`Store "${storeName}" not found`);
      } catch (err) {
        console.error('Storefront: Exception in store fetch', err);
        throw err;
      }
    },
    enabled: !!normalizedStoreName && !cachedData,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: cachedData ? { store: cachedData.store, redirectNeeded: false } : undefined,
  });

  // Extract store from the data structure
  const store = storeData?.store;
  
  // Fetch products with caching
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
    enabled: !!store?.id && !cachedData,
    retry: 1,
    retryDelay: 500,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    initialData: cachedData?.products,
  });

  // Cache data when both store and products are loaded
  useEffect(() => {
    if (store && products && !cachedData) {
      setCachedData(storeName, store, products);
    }
  }, [store, products, storeName, setCachedData, cachedData]);
  
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

  // Remove the auto-invalidation on window focus to prevent automatic reloading
  // This was causing the store to reload every time the user switched tabs
  
  // Show loading state while store is being fetched
  if (storeLoading && !cachedData) {
    return <StorefrontLoader storeName={storeName} />;
  }
  
  // Show error page if store not found ONLY after loading is complete
  if (storeError || (!store && !storeLoading && !cachedData)) {
    console.error('Storefront: Rendering error page due to store error');
    return <StoreNotFound storeName={storeName} />;
  }
  
  // Don't render content until store data is available
  if (!store && !cachedData) {
    return <StorefrontLoader storeName={storeName} />;
  }

  // Use cached data if available
  const storeDataFinal = store || cachedData?.store;
  const productsData = products || cachedData?.products || [];
  
  // Ensure products is always an array
  const safeProducts = Array.isArray(productsData) ? productsData as Tables<'products'>[] : [];
  
  // Process theme data with enhanced color system
  const themeData = storeDataFinal.theme && typeof storeDataFinal.theme === 'object' ? storeDataFinal.theme as any : {};
  console.log('Storefront: Processing theme data:', themeData);

  // Get color palette for fallbacks
  const colorPaletteId = themeData.color_palette || 'urban-modern';
  const selectedPalette = COLOR_PALETTES.find(p => p.id === colorPaletteId) || COLOR_PALETTES[0];
  
  // Enhanced store object with properly mapped colors
  const enhancedStore = {
    ...storeDataFinal,
    primaryColor: themeData.primaryColor || selectedPalette.primary,
    textColor: themeData.textColor || '#F9FAFB',
    buttonColor: themeData.buttonColor || selectedPalette.cta,
    buttonTextColor: themeData.buttonTextColor || '#FFFFFF',
    accentColor: themeData.accentColor || selectedPalette.accent,
    font_style: storeDataFinal.font_style || themeData.font_style || 'Poppins',
    theme: {
      ...themeData,
      primaryColor: themeData.primaryColor || selectedPalette.primary,
      textColor: themeData.textColor || '#F9FAFB',
      buttonColor: themeData.buttonColor || selectedPalette.cta,
      buttonTextColor: themeData.buttonTextColor || '#FFFFFF',
      accentColor: themeData.accentColor || selectedPalette.accent,
      color_palette: colorPaletteId,
      font_style: storeDataFinal.font_style || themeData.font_style || 'Poppins',
      instagram_url: themeData.instagram_url || '',
      facebook_url: themeData.facebook_url || '',
      whatsapp_url: themeData.whatsapp_url || ''
    }
  };
  
  console.log('Storefront: Enhanced store with applied customization:', {
    name: enhancedStore.name,
    username: enhancedStore.username,
    slug: enhancedStore.slug,
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

  // Show skeleton loading for products if they're still loading
  if (productsLoading && !cachedData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <ModernStorefront 
      store={enhancedStore} 
      products={safeProducts} 
      isLoading={productsLoading && !cachedData}
    />
  );
};

export default Storefront;
