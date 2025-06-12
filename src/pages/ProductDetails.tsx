
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

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  status: string;
  is_published: boolean;
  store_id: string;
  store_name: string;
}

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

  // Simplified fetch function with explicit typing
  const fetchProductData = async (): Promise<ProductData> => {
    if (!storeName || !productSlug) {
      throw new Error('Missing store name or product slug');
    }

    try {
      // Get store data first
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .or(`slug.eq.${storeName},username.eq.${storeName},name.eq.${storeName}`)
        .maybeSingle();

      if (storeError) {
        console.error('Store query error:', storeError);
        throw new Error(`Store query failed: ${storeError.message}`);
      }

      if (!storeData) {
        throw new Error(`Store "${storeName}" not found`);
      }

      // Get product data
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, images, status, is_published, store_id')
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
        throw new Error(`Product "${productSlug}" not found in store "${storeName}"`);
      }

      // Return the combined data
      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url,
        images: productData.images,
        status: productData.status,
        is_published: productData.is_published,
        store_id: productData.store_id,
        store_name: storeData.name
      };
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setFetchError(err.message);
      throw err;
    }
  };

  // Use simplified query
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
