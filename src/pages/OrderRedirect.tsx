import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

/**
 * OrderRedirect component
 * 
 * This component handles the redirection from the "Order Now" button to the Checkout page.
 * It extracts the productId from the URL query parameter, fetches the product details,
 * and then redirects to the Checkout page with the product information.
 */
const OrderRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId');

  // Fetch product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    // If product data is loaded, redirect to checkout
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
    
    // If there's an error or no productId, redirect to home
    if (error || !productId) {
      navigate('/');
    }
  }, [product, error, productId, navigate]);

  // Show loading state while fetching product
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Preparing your order...</p>
    </div>
  );
};

export default OrderRedirect;