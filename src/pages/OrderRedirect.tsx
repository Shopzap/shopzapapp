
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

/**
 * OrderRedirect component
 * 
 * This component handles the redirection from the "Order Now" button to the Checkout page.
 * It supports both legacy UUID-based and new slug-based product URLs.
 */
const OrderRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId');
  const productSlug = queryParams.get('productSlug');
  const storeUsername = queryParams.get('storeUsername');

  // Fetch product data - support both UUID and slug-based lookups
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product-redirect', productId, productSlug, storeUsername],
    queryFn: async () => {
      // If we have productSlug and storeUsername, use the new method
      if (productSlug && storeUsername) {
        // Get store first
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('username', storeUsername)
          .single();
          
        if (storeError) throw storeError;
        
        // Then get product by slug
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', productSlug)
          .eq('store_id', storeData.id)
          .single();
          
        if (error) throw error;
        return data;
      }
      
      // Fallback to UUID-based lookup for legacy support
      if (productId) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (error) throw error;
        return data;
      }
      
      throw new Error('No product identifier provided');
    },
    enabled: !!(productId || (productSlug && storeUsername)),
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
      
      // Navigate to store-specific checkout if we have the store username
      if (storeUsername) {
        navigate(`/store/${storeUsername}/checkout`, { 
          state: { 
            orderItems: [orderItem]
          } 
        });
      } else {
        // Fallback to legacy checkout route
        navigate('/checkout', { 
          state: { 
            orderItems: [orderItem]
          } 
        });
      }
    }
    
    // If there's an error or no product identifier, redirect to home
    if (error || (!productId && !(productSlug && storeUsername))) {
      navigate('/');
    }
  }, [product, error, productId, productSlug, storeUsername, navigate]);

  // Show loading state while fetching product
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Preparing your order...</p>
    </div>
  );
};

export default OrderRedirect;
