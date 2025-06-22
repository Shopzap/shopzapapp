
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
import { ProductVariant } from '@/components/product/types';
import { Json } from '@/integrations/supabase/types';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
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

  // Set dynamic meta tags for SEO
  useEffect(() => {
    if (productId) {
      // Update page title and meta tags
      document.title = `Product Details - ShopZap`;
      
      // Add/update meta tags
      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) || 
                   document.querySelector(`meta[property="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          if (name.startsWith('og:')) {
            meta.setAttribute('property', name);
          } else {
            meta.setAttribute('name', name);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMetaTag('description', 'View product details and specifications');
      updateMetaTag('og:title', 'Product Details - ShopZap');
      updateMetaTag('og:description', 'View product details and specifications');
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:type', 'product');
    }
  }, [productId]);

  const fetchProductData = async () => {
    if (!productId) {
      throw new Error('Missing product ID');
    }

    try {
      console.log('Fetching product:', { productId });

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id, name, description, price, image_url, images, status, is_published, 
          store_id, slug, inventory_count, payment_method, category, created_at, updated_at, product_type,
          stores!inner(id, name, username)
        `)
        .eq('id', productId)
        .eq('status', 'active')
        .eq('is_published', true)
        .maybeSingle();

      if (productError) {
        console.error('Product query error:', productError);
        throw new Error(`Product query failed: ${productError.message}`);
      }

      if (!productData) {
        console.error('Product not found:', { productId });
        throw new Error(`Product not found`);
      }

      console.log('Product found:', productData);

      // Update meta tags with product data
      if (productData) {
        document.title = `${productData.name} - ${productData.stores.name}`;
        
        const updateMetaTag = (name: string, content: string) => {
          let meta = document.querySelector(`meta[name="${name}"]`) || 
                     document.querySelector(`meta[property="${name}"]`);
          if (!meta) {
            meta = document.createElement('meta');
            if (name.startsWith('og:')) {
              meta.setAttribute('property', name);
            } else {
              meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        };

        updateMetaTag('description', productData.description || `${productData.name} - Available at ${productData.stores.name}`);
        updateMetaTag('og:title', `${productData.name} - ${productData.stores.name}`);
        updateMetaTag('og:description', productData.description || `${productData.name} - Available at ${productData.stores.name}`);
        updateMetaTag('og:image', productData.image_url || '/placeholder.svg');
        updateMetaTag('og:url', window.location.href);
        updateMetaTag('product:price:amount', productData.price.toString());
        updateMetaTag('product:price:currency', 'INR');
      }

      // Fetch variants if product type is variant
      let variants: ProductVariant[] = [];
      if (productData.product_type === 'variant') {
        const { data: variantData, error: variantError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productData.id);

        if (variantError) {
          console.error('Error fetching variants:', variantError);
        } else {
          variants = (variantData || []).map(variant => ({
            ...variant,
            options: typeof variant.options === 'object' && variant.options !== null 
              ? variant.options as Record<string, string>
              : {}
          }));
        }
      }

      return {
        ...productData,
        store_name: productData.stores.name,
        variants,
        product_type: (productData.product_type === 'variant' ? 'variant' : 'simple') as 'simple' | 'variant'
      };
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setFetchError(err.message);
      throw err;
    }
  };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: fetchProductData,
    enabled: !!productId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { shouldShowLoading, hasTimedOut } = useDelayedLoading(isLoading, {
    delay: 200,
    timeout: 8000
  });

  const handleBuyNow = async (selectedVariant?: ProductVariant) => {
    if (!product || isBuyingNow) return;
    
    setIsBuyingNow(true);
    
    try {
      // Check inventory before proceeding
      let availableStock = 0;
      let productPrice = product.price;
      let productImage = product.image_url;

      if (product.product_type === 'variant' && selectedVariant) {
        availableStock = selectedVariant.inventory_count;
        productPrice = selectedVariant.price;
        productImage = selectedVariant.image_url || product.image_url;
      } else if (product.product_type === 'simple') {
        availableStock = product.inventory_count || 0;
      }

      if (availableStock <= 0) {
        toast({
          title: "Out of Stock",
          description: "This product is currently out of stock",
          variant: "destructive"
        });
        setIsBuyingNow(false);
        return;
      }

      const orderItem = {
        id: product.id,
        name: product.name,
        price: productPrice,
        quantity: 1,
        image: productImage || 'https://placehold.co/80x80',
        variant: selectedVariant ? {
          id: selectedVariant.id || '',
          options: selectedVariant.options,
          name: Object.values(selectedVariant.options || {}).join(' / ')
        } : undefined
      };
      
      // Show success toast
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
      
      // Navigate to checkout with relative path
      setTimeout(() => {
        navigate('/checkout', { 
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
    navigate(-1);
  };

  useEffect(() => {
    if (!productId) {
      navigate('/', { replace: true });
    }
  }, [productId, navigate]);

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
            productName={productId}
            storeName=""
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
