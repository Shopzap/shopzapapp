import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import NotFound from './NotFound';

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-accent rounded-lg overflow-hidden flex items-center justify-center h-[400px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground">No image available</div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mt-2">
              {formatPrice(product.price)}
            </p>
            
            {product.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}
            
            <div className="mt-8">
              <Button 
                size="lg" 
                className="w-full md:w-auto"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            <div className="mt-auto pt-8">
              <p className="text-sm text-muted-foreground">
                From {product.stores?.name || 'Store'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;