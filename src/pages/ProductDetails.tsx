
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader, ArrowLeft } from 'lucide-react';
import StoreNotFound from '@/components/storefront/StoreNotFound';
import ProductDetailsContent from '@/components/product/ProductDetailsContent';
import { useCart } from '@/hooks/useCart';

const ProductDetails = () => {
  const { storeName, productSlug } = useParams<{ storeName: string; productSlug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // First, fetch the store to get store_id
  const { data: store, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-by-name', storeName],
    queryFn: async () => {
      if (!storeName) {
        throw new Error('No store name provided');
      }
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', storeName)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!storeName,
  });

  // Then fetch product data using the product slug and store_id
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product-by-slug', productSlug, store?.id],
    queryFn: async () => {
      if (!productSlug || !store?.id) {
        throw new Error('Missing product slug or store ID');
      }

      // Convert slug back to product name for searching
      const productName = productSlug.replace(/-/g, ' ');
      
      const { data, error } = await supabase
        .from('products')
        .select('*, stores(*)')
        .eq('store_id', store.id)
        .ilike('name', productName)
        .eq('status', 'active')
        .eq('is_published', true)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!productSlug && !!store?.id,
  });

  const isLoading = storeLoading || productLoading;
  const hasError = storeError || productError;

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Handle navigation to checkout
  const handleBuyNow = async () => {
    if (!product) return;
    
    // Add to cart first
    await handleAddToCart();
    
    // Navigate to store-specific checkout
    if (storeName) {
      navigate(`/store/${storeName}/checkout`);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (storeName) {
      navigate(`/store/${storeName}`);
    } else {
      navigate('/');
    }
  };

  // Show error page if store not found
  if (storeError) {
    return <StoreNotFound storeName={storeName} />;
  }

  // Show error page if product not found but store exists
  if (productError && store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product "{productSlug}" doesn't exist in this store.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product "{productSlug}" doesn't exist in this store.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Button>
      </div>
    );
  }

  return (
    <ProductDetailsContent
      product={product}
      handleBuyNow={handleBuyNow}
      handleBack={handleBack}
      onAddToCart={handleAddToCart}
    />
  );
};

export default ProductDetails;
