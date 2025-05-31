import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import NotFound from './NotFound';
import ProductDetailsContent from '@/components/product/ProductDetailsContent';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  // Fetch product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, stores(*)')
        .eq('id', productId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Handle navigation to checkout
  const handleBuyNow = () => {
    // Create an order item from the product
    const orderItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url || 'https://placehold.co/80x80'
    };
    
    // Navigate to checkout with order item
    navigate('/checkout', { 
      state: { 
        orderItems: [orderItem]
      } 
    });
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Show error page if product not found
  if (error) {
    return <NotFound />;
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
    return <NotFound />;
  }

  return (
    <ProductDetailsContent
      product={product}
      handleBuyNow={handleBuyNow}
      handleBack={handleBack}
    />
  );
};

export default ProductDetails;