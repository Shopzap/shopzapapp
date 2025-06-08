
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

const ProductDetails = () => {
  const { storeName, productSlug } = useParams<{ storeName: string; productSlug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch store data
  const { data: store } = useQuery({
    queryKey: ['store-by-name', storeName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeName!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeName,
  });

  // Fetch product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productSlug],
    queryFn: async () => {
      if (!store?.id) return null;
      
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

  if (error || !product) {
    return <NotFound />;
  }

  if (isLoading || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
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
