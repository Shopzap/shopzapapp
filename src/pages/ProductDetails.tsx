
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductDetailsContent from '@/components/product/ProductDetailsContent';
import ProductDetailsSkeleton from '@/components/skeletons/ProductDetailsSkeleton';
import ProductNotFound from '@/components/fallbacks/ProductNotFound';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { useSmartRetry } from '@/hooks/useSmartRetry';
import ErrorBoundary from '@/components/ErrorBoundary';

const ProductDetails: React.FC = () => {
  const { storeName, productSlug } = useParams<{ 
    storeName: string; 
    productSlug: string; 
  }>();
  const navigate = useNavigate();
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Smart retry hook
  const { retry, canRetry } = useSmartRetry({
    maxRetries: 2,
    onRetry: () => {
      setFetchError(null);
      window.location.reload();
    }
  });

  // Fetch product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', storeName, productSlug],
    queryFn: async () => {
      if (!storeName || !productSlug) {
        throw new Error('Missing store name or product slug');
      }

      try {
        // First get the store
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, name')
          .or(`slug.eq.${storeName},username.eq.${storeName},name.eq.${storeName}`)
          .maybeSingle();

        if (storeError || !store) {
          throw new Error(`Store "${storeName}" not found`);
        }

        // Then get the product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('slug', productSlug)
          .eq('status', 'active')
          .eq('is_published', true)
          .maybeSingle();

        if (productError) {
          throw productError;
        }

        if (!productData) {
          throw new Error(`Product "${productSlug}" not found in store "${storeName}"`);
        }

        return {
          ...productData,
          store_name: store.name
        };
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setFetchError(err.message);
        throw err;
      }
    },
    enabled: !!storeName && !!productSlug,
    retry: false, // We handle retries manually
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use delayed loading
  const { shouldShowLoading, hasTimedOut } = useDelayedLoading(isLoading, {
    delay: 300,
    timeout: 8000
  });

  // Redirect if missing params
  useEffect(() => {
    if (!storeName || !productSlug) {
      navigate('/', { replace: true });
    }
  }, [storeName, productSlug, navigate]);

  // Show skeleton loading
  if (shouldShowLoading) {
    return <ProductDetailsSkeleton />;
  }

  // Show error or timeout fallback
  if (hasTimedOut || (error && !product)) {
    return (
      <ProductNotFound
        productName={productSlug}
        storeName={storeName}
        onRetry={canRetry ? retry : undefined}
      />
    );
  }

  // Show product details
  if (product) {
    return (
      <ErrorBoundary>
        <ProductDetailsContent product={product} />
      </ErrorBoundary>
    );
  }

  // Fallback
  return <ProductDetailsSkeleton />;
};

export default ProductDetails;
