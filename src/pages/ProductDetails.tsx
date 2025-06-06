
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import NotFound from './NotFound';
import ProductDetailsContent from '@/components/product/ProductDetailsContent';

// Reserved paths that should not be treated as store slugs
const RESERVED_PATHS = [
  'auth', 'login', 'signup', 'verify', 'auth-callback',
  'dashboard', 'onboarding', 'store-builder', 'embed-generator',
  'pricing', 'features', 'about', 'privacy', 'terms',
  'order-success', 'track-order', 'order', 'admin'
];

const ProductDetails = () => {
  const { storeSlug, productSlug, productId } = useParams<{ 
    storeSlug?: string; 
    productSlug?: string; 
    productId?: string; 
  }>();
  const navigate = useNavigate();

  console.log('ProductDetails: Params received', { storeSlug, productSlug, productId });

  // Check if this is a reserved path for storeSlug
  if (storeSlug && RESERVED_PATHS.includes(storeSlug.toLowerCase())) {
    console.log('ProductDetails: Reserved path detected, redirecting to 404');
    return <NotFound />;
  }

  // Determine if we're using the new route format (/:storeSlug/:productSlug) or legacy (/product/:productId)
  const isNewRouteFormat = !!(storeSlug && productSlug);
  const isLegacyFormat = !!productId;

  // Fetch product data based on route format
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', isNewRouteFormat ? `${storeSlug}-${productSlug}` : productId],
    queryFn: async () => {
      if (isNewRouteFormat && storeSlug && productSlug) {
        console.log('ProductDetails: Fetching product using new format', { storeSlug, productSlug });
        
        // First, get the store to validate it exists
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, name')
          .ilike('name', storeSlug)
          .single();
          
        if (storeError) {
          console.error('ProductDetails: Store not found', storeError);
          throw new Error('Store not found');
        }
        
        // Then fetch the product by name within that store
        const { data, error } = await supabase
          .from('products')
          .select('*, stores(*)')
          .eq('store_id', store.id)
          .ilike('name', productSlug.replace(/-/g, ' ')) // Convert slug back to name
          .single();
          
        if (error) {
          console.error('ProductDetails: Error fetching product by slug', error);
          throw error;
        }
        
        return data;
      } else if (isLegacyFormat && productId) {
        console.log('ProductDetails: Fetching product using legacy format', productId);
        
        // Legacy format - fetch by product ID
        const { data, error } = await supabase
          .from('products')
          .select('*, stores(*)')
          .eq('id', productId)
          .single();
          
        if (error) {
          console.error('ProductDetails: Error fetching product by ID', error);
          throw error;
        }
        
        return data;
      } else {
        throw new Error('Invalid route parameters');
      }
    },
    enabled: !!(isNewRouteFormat ? (storeSlug && productSlug) : productId),
  });

  // Handle navigation to checkout
  const handleBuyNow = () => {
    if (!product) return;
    
    // Create an order item from the product
    const orderItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url || 'https://placehold.co/80x80'
    };
    
    // Navigate to checkout with order item
    if (isNewRouteFormat && storeSlug) {
      navigate(`/${storeSlug}/checkout`, { 
        state: { 
          orderItems: [orderItem]
        } 
      });
    } else {
      navigate('/checkout', { 
        state: { 
          orderItems: [orderItem]
        } 
      });
    }
  };

  // Handle back button
  const handleBack = () => {
    if (isNewRouteFormat && storeSlug) {
      navigate(`/${storeSlug}`);
    } else {
      navigate(-1);
    }
  };

  // Show error page if product not found
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or is unavailable.</p>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
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
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or is unavailable.</p>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
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
