
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

  // Improved fetch function with proper store and product slug filtering
  const fetchProductData = async () => {
    if (!storeName || !productSlug) {
      throw new Error('Missing store name or product slug');
    }

    try {
      console.log('Fetching product:', { storeName, productSlug });

      // First, get the store by name, slug, or username
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name, slug')
        .or(`slug.eq.${storeName},username.eq.${storeName},name.ilike.${storeName}`)
        .maybeSingle();

      if (storeError) {
        console.error('Store query error:', storeError);
        throw new Error(`Store query failed: ${storeError.message}`);
      }

      if (!storeData) {
        console.error('Store not found:', storeName);
        throw new Error(`Store "${storeName}" not found`);
      }

      console.log('Store found:', storeData);

      // Then get the product by slug within that store
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          description, 
          price, 
          image_url, 
          images, 
          status, 
          is_published, 
          store_id, 
          slug,
          inventory_count,
          payment_method,
          created_at,
          updated_at
        `)
        .eq('store_id', storeData.id)
        .eq('slug', productSlug)
        .eq('status', 'active')
        .eq('is_published', true)
        .maybeSingle();

      if (productError) {
        console.error('Product query error:', productError);
        throw new Error(`Product query failed: ${productError.message}`);
      }

      if (!productData) {
        console.error('Product not found:', { productSlug, storeId: storeData.id });
        throw new Error(`Product "${productSlug}" not found in store "${storeName}"`);
      }

      console.log('Product found:', productData);

      // Return the combined data
      return {
        ...productData,
        store_name: storeData.name
      };
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setFetchError(err.message);
      throw err;
    }
  };

  // Use query with proper error handling
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', storeName, productSlug],
    queryFn: fetchProductData,
    enabled: !!storeName && !!productSlug,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Use delayed loading
  const { shouldShowLoading, hasTimedOut } = useDelayedLoading(isLoading, {
    delay: 300,
    timeout: 8000
  });

  // Handle Buy Now action
  const handleBuyNow = () => {
    if (product) {
      const orderItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image_url || 'https://placehold.co/80x80'
      };
      
      navigate('/checkout', { 
        state: { 
          orderItems: [orderItem]
        } 
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (storeName) {
      navigate(`/store/${storeName}`);
    } else {
      navigate('/');
    }
  };

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

  // Show error or timeout fallback with improved 404 UI
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
        <ProductDetailsContent 
          product={product} 
          handleBuyNow={handleBuyNow}
          handleBack={handleBack}
        />
      </ErrorBoundary>
    );
  }

  // Fallback
  return <ProductDetailsSkeleton />;
};

export default ProductDetails;
