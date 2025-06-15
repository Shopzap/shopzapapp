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
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useToast } from '@/hooks/use-toast';

const ProductDetails: React.FC = () => {
  const { storeName: storeUsername, productSlug } = useParams<{ 
    storeName: string; 
    productSlug: string; 
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { retry, canRetry } = useSmartRetry({
    maxRetries: 2,
    onRetry: () => {
      setFetchError(null);
      window.location.reload();
    }
  });

  const fetchProductData = async () => {
    if (!storeUsername || !productSlug) {
      throw new Error('Missing store username or product slug');
    }

    try {
      console.log('Fetching product:', { storeUsername, productSlug });

      const normalizedStoreUsername = storeUsername.toLowerCase().trim();

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name, username')
        .eq('username', normalizedStoreUsername)
        .maybeSingle();

      if (storeError) {
        console.error('Store query error:', storeError);
        throw new Error(`Store query failed: ${storeError.message}`);
      }

      if (!storeData) {
        console.error('Store not found:', storeUsername);
        throw new Error(`Store "${storeUsername}" not found`);
      }

      console.log('Store found:', storeData);

      let { data: productData, error: productError } = await supabase
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
          category,
          created_at,
          updated_at
        `)
        .eq('store_id', storeData.id)
        .eq('slug', productSlug)
        .eq('status', 'active')
        .eq('is_published', true)
        .maybeSingle();

      if (!productData && !productError && productSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('Slug looks like UUID, trying to fetch by ID as fallback');
        const fallbackResult = await supabase
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
            category,
            created_at,
            updated_at
          `)
          .eq('store_id', storeData.id)
          .eq('id', productSlug)
          .eq('status', 'active')
          .eq('is_published', true)
          .maybeSingle();

        if (fallbackResult.data && !fallbackResult.error) {
          const correctSlug = fallbackResult.data.slug;
          console.log('Found product by UUID, redirecting to slug-based URL:', correctSlug);
          navigate(`/store/${storeUsername}/product/${correctSlug}`, { replace: true });
          return fallbackResult.data;
        }
      }

      if (productError) {
        console.error('Product query error:', productError);
        throw new Error(`Product query failed: ${productError.message}`);
      }

      if (!productData) {
        console.error('Product not found:', { productSlug, storeId: storeData.id });
        throw new Error(`Product "${productSlug}" not found in store "${storeUsername}"`);
      }

      console.log('Product found:', productData);

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

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', storeUsername, productSlug],
    queryFn: fetchProductData,
    enabled: !!storeUsername && !!productSlug,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { shouldShowLoading, hasTimedOut } = useDelayedLoading(isLoading, {
    delay: 200,
    timeout: 8000
  });

  const handleBuyNow = async () => {
    if (!product || isBuyingNow) return;
    
    setIsBuyingNow(true);
    
    try {
      const orderItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image_url || 'https://placehold.co/80x80'
      };
      
      // Show success toast
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
      
      // Navigate to checkout with proper username-based URL
      setTimeout(() => {
        navigate(`/store/${storeUsername}/checkout`, { 
          state: { 
            orderItems: [orderItem],
            fromBuyNow: true
          } 
        });
      }, 500);
    } catch (error) {
      console.error('Error during buy now:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive"
      });
      setIsBuyingNow(false);
    }
  };

  const handleBack = () => {
    if (storeUsername) {
      navigate(`/store/${storeUsername}`);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (!storeUsername || !productSlug) {
      navigate('/', { replace: true });
    }
  }, [storeUsername, productSlug, navigate]);

  if (shouldShowLoading) {
    return (
      <ResponsiveLayout>
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ProductDetailsSkeleton />
        </div>
      </ResponsiveLayout>
    );
  }

  if (hasTimedOut || (error && !product)) {
    return (
      <ResponsiveLayout>
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ProductNotFound
            productName={productSlug}
            storeName={storeUsername}
            onRetry={canRetry ? retry : undefined}
          />
        </div>
      </ResponsiveLayout>
    );
  }

  if (product) {
    return (
      <ResponsiveLayout>
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ErrorBoundary>
            <ProductDetailsContent 
              product={product} 
              handleBuyNow={handleBuyNow}
              handleBack={handleBack}
              isBuyingNow={isBuyingNow}
            />
          </ErrorBoundary>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ProductDetailsSkeleton />
      </div>
    </ResponsiveLayout>
  );
};

export default ProductDetails;
