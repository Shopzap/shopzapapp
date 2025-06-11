
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import ModernStorefrontHeader from '@/components/storefront/ModernStorefrontHeader';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductFeatures from '@/components/product/ProductFeatures';
import StoreInfo from '@/components/product/StoreInfo';
import NotFound from './NotFound';
import StorefrontLoader from '@/components/storefront/StorefrontLoader';

const ProductDetails = () => {
  const { storeName, productSlug } = useParams<{ storeName: string; productSlug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Normalize the store name to lowercase for consistent querying
  const normalizedStoreName = storeName?.toLowerCase();

  // Fetch store data with improved error handling
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-by-name', normalizedStoreName],
    queryFn: async () => {
      if (!normalizedStoreName) {
        throw new Error('No store name provided');
      }
      
      console.log('ProductDetails: Fetching store data for identifier', normalizedStoreName);
      
      try {
        // First, try to find by slug (new preferred method)
        let { data: slugData, error: slugError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', normalizedStoreName)
          .maybeSingle();
          
        if (slugData && !slugError) {
          console.log('ProductDetails: Store found by slug', slugData);
          return slugData;
        }
        
        // If not found by slug, try username (legacy support)
        console.log('ProductDetails: Trying with username field', normalizedStoreName);
        let { data: usernameData, error: usernameError } = await supabase
          .from('stores')
          .select('*')
          .eq('username', normalizedStoreName)
          .maybeSingle();
          
        if (usernameData && !usernameError) {
          console.log('ProductDetails: Store found by username', usernameData);
          return usernameData;
        }
        
        // Finally, try name field as fallback using direct equality
        console.log('ProductDetails: Final attempt with direct name match', normalizedStoreName);
        let { data: directData, error: directError } = await supabase
          .from('stores')
          .select('*')
          .eq('name', normalizedStoreName)
          .maybeSingle();
          
        if (directData && !directError) {
          console.log('ProductDetails: Store found by direct name match', directData);
          return directData;
        }
        
        console.error('ProductDetails: Store not found with any identifier', normalizedStoreName);
        throw new Error(`Store "${storeName}" not found`);
      } catch (err) {
        console.error('ProductDetails: Exception in store fetch', err);
        throw err;
      }
    },
    enabled: !!normalizedStoreName,
    retry: 2,
    retryDelay: 1000,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch product data
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', productSlug],
    queryFn: async () => {
      if (!store?.id || !productSlug) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productSlug)
        .eq('store_id', store.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!productSlug && !!store?.id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate(`/store/${storeName}/cart`);
  };

  const handleShare = () => {
    const productUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description || `Check out ${product?.name}`,
        url: productUrl,
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // Show loading state while store or product is being fetched
  if (storeLoading || productLoading) {
    return <StorefrontLoader storeName={storeName} message="Loading product..." />;
  }

  // Show error page if store not found ONLY after loading is complete
  if (storeError || (!store && !storeLoading)) {
    return <NotFound />;
  }

  // Show error page if product not found ONLY after loading is complete
  if (productError || (!product && !productLoading && store)) {
    return <NotFound />;
  }

  // Don't render content until both store and product data are available
  if (!store || !product) {
    return <StorefrontLoader storeName={storeName} message="Loading product..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStorefrontHeader store={store} />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/store/${storeName}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <ProductImageGallery 
            imageUrl={product.image_url}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="space-y-6">
            <ProductInfo
              product={product}
              formatPrice={formatPrice}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onShare={handleShare}
              onWishlist={handleWishlist}
              isWishlisted={isWishlisted}
            />

            <Separator />

            {/* Product Features */}
            <ProductFeatures />

            {/* Store Info */}
            <StoreInfo store={store} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
