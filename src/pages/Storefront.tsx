
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ModernStorefront from "@/components/storefront/ModernStorefront";
import StoreNotFound from "@/components/fallbacks/StoreNotFound";
import StorefrontSkeleton from "@/components/skeletons/StorefrontSkeleton";
import { useStoreCache, preloadCriticalResources } from "@/components/storefront/StoreCacheManager";
import { Tables } from "@/integrations/supabase/types";
import { COLOR_PALETTES } from "@/components/storefront/ColorPaletteSelector";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useSmartRetry } from "@/hooks/useSmartRetry";
import ErrorBoundary from "@/components/ErrorBoundary";

const Storefront: React.FC = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { getCachedData, setCachedData } = useStoreCache(storeName || '');
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Preload critical resources on component mount
  useEffect(() => {
    preloadCriticalResources();
  }, []);

  // Normalize the store name to lowercase for consistent querying
  const normalizedStoreName = storeName?.toLowerCase();

  // Redirect to home if no store name provided
  if (!storeName || storeName.trim() === '') {
    console.error('Storefront: No store name provided in URL');
    return <Navigate to="/" replace />;
  }

  // Check cache first
  const cachedData = getCachedData(storeName);
  
  // Smart retry hook
  const { retry, canRetry, isRetrying } = useSmartRetry({
    maxRetries: 2,
    retryDelay: 1000,
    onRetry: () => {
      setFetchError(null);
      queryClient.invalidateQueries({ queryKey: ['store-lookup', normalizedStoreName] });
    }
  });
  
  // Fetch store data with improved error handling and query logic
  const { data: storeData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-lookup', normalizedStoreName],
    queryFn: async () => {
      console.log('Storefront: Fetching store data for identifier', normalizedStoreName);
      
      try {
        // First, try to find by username (preferred method)
        let { data: usernameData, error: usernameError } = await supabase
          .from('stores')
          .select('*')
          .eq('username', normalizedStoreName)
          .maybeSingle();
          
        if (usernameData && !usernameError) {
          console.log('Storefront: Store found by username', usernameData);
          return { store: usernameData, redirectNeeded: false };
        }
        
        // If not found by username, try name field as fallback
        let { data: nameData, error: nameError } = await supabase
          .from('stores')
          .select('*')
          .eq('name', normalizedStoreName)
          .maybeSingle();
          
        if (nameData && !nameError) {
          console.log('Storefront: Store found by name', nameData);
          return { store: nameData, redirectNeeded: false };
        }
        
        console.error('Storefront: Store not found with any identifier', normalizedStoreName);
        throw new Error(`Store "${storeName}" not found`);
      } catch (err: any) {
        console.error('Storefront: Exception in store fetch', err);
        setFetchError(err.message);
        throw err;
      }
    },
    enabled: !!normalizedStoreName && !cachedData,
    retry: false, // We handle retries manually
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

  // Use delayed loading for better UX
  const { shouldShowLoading, hasTimedOut } = useDelayedLoading(
    storeLoading || productsLoading, 
    { delay: 300, timeout: 8000 }
  );

  // Cache data when both store and products are loaded
  useEffect(() => {
    if (store && products && !cachedData) {
      setCachedData(storeName, store, products);
    }
  }, [store, products, storeName, setCachedData, cachedData]);
  
  // Show skeleton loading only after delay
  if (shouldShowLoading && !cachedData) {
    return <StorefrontSkeleton />;
  }

  // Show timeout or error fallback
  if (hasTimedOut || (storeError && !store && !cachedData)) {
    return (
      <StoreNotFound 
        storeName={storeName} 
        onRetry={canRetry ? retry : undefined}
      />
    );
  }
  
  // Don't render content until store data is available
  if (!store && !cachedData) {
    return <StorefrontSkeleton />;
  }

  // Use cached data if available
  const storeDataFinal = store || cachedData?.store;
  const productsData = products || cachedData?.products || [];
  
  // Ensure products is always an array
  const safeProducts = Array.isArray(productsData) ? productsData as Tables<'products'>[] : [];
  
  // Process theme data with enhanced color system
  const themeData = storeDataFinal.theme && typeof storeDataFinal.theme === 'object' ? storeDataFinal.theme as any : {};

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

  return (
    <ErrorBoundary>
      <ModernStorefront 
        store={enhancedStore} 
        products={safeProducts} 
        isLoading={shouldShowLoading && !cachedData}
      />
    </ErrorBoundary>
  );
};

export default Storefront;
