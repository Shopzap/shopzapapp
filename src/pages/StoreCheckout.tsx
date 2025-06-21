
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreNotFound from '@/components/storefront/StoreNotFound';
import StorefrontLoader from '@/components/storefront/StorefrontLoader';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';

const StoreCheckout = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const navigate = useNavigate();
  const { items, getTotalPrice, getItemCount } = useCart();
  
  const normalizedStoreName = storeName?.toLowerCase();

  // Fetch store data
  const { data: storeData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-checkout', normalizedStoreName],
    queryFn: async () => {
      if (!normalizedStoreName) throw new Error('Store name is required');
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('username', normalizedStoreName)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) throw new Error('Store not found');
      
      return data;
    },
    enabled: !!normalizedStoreName,
  });

  // Transform cart items to checkout format
  const orderItems = items.map((item, index) => ({
    id: index + 1,
    name: item.product.name,
    price: parseFloat(item.product.price.toString()),
    quantity: item.quantity,
    image: item.product.image_url || 'https://placehold.co/80x80',
    variant: undefined // Add variant support if needed
  }));

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const {
    isLoading: checkoutLoading,
    paymentMethod,
    setPaymentMethod,
    razorpayAvailable,
    paymentMode,
    handlePlaceOrder,
    sellerAllowsCOD,
    sellerAllowsOnline
  } = useCheckout();

  const handleContinueShopping = () => {
    if (storeData?.username) {
      navigate(`/store/${storeData.username}`);
    } else if (storeName) {
      navigate(`/store/${storeName}`);
    } else {
      navigate('/');
    }
  };

  if (storeLoading) {
    return <StorefrontLoader storeName={normalizedStoreName || ''} message="Loading checkout..." />;
  }

  if (storeError || !storeData) {
    return <StoreNotFound storeName={normalizedStoreName || ''} />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreHeader store={storeData} />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to checkout!</p>
              <Button onClick={handleContinueShopping} className="w-full">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader store={storeData} />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={handleContinueShopping}
              className="flex items-center gap-2 text-sm w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full sm:w-auto">
              Checkout
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>

          {/* Checkout Content */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <CheckoutForm
                onSubmit={handlePlaceOrder}
                isLoading={checkoutLoading}
                total={total}
                paymentMethod={paymentMethod}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                orderItems={orderItems}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                storeName={storeData.name}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                razorpayAvailable={razorpayAvailable}
                paymentMode={paymentMode}
                sellerAllowsCOD={sellerAllowsCOD}
                sellerAllowsOnline={sellerAllowsOnline}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCheckout;
