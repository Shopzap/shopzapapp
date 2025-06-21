
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingBag, Home } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';

const Checkout = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotalPrice, getItemCount, currentStore } = useCart();
  
  // Get store name from URL params or cart context
  const effectiveStoreName = storeName || currentStore;
  const normalizedStoreName = effectiveStoreName?.toLowerCase();

  // Fetch store data if we have a store context
  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ['store-checkout', normalizedStoreName],
    queryFn: async () => {
      if (!normalizedStoreName) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('username', normalizedStoreName)
        .maybeSingle();
        
      if (error || !data) {
        // Try by name as fallback
        const { data: nameData } = await supabase
          .from('stores')
          .select('*')
          .eq('name', normalizedStoreName)
          .maybeSingle();
        return nameData;
      }
      
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
    variant: undefined
  }));

  const subtotal = getTotalPrice();
  const shipping = 0;
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
    } else if (effectiveStoreName) {
      navigate(`/store/${effectiveStoreName}`);
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (storeLoading && normalizedStoreName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {storeData ? (
          <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold">{storeData.name}</h1>
                <Button variant="ghost" onClick={handleContinueShopping} className="flex items-center gap-2 text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Store</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold">Checkout</h1>
                <Button variant="ghost" onClick={handleGoHome} className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-8">
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Add some products to checkout!</p>
              <Button onClick={handleContinueShopping} className="w-full sm:w-auto">
                {storeData ? 'Continue Shopping' : 'Go to Homepage'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {storeData ? (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold">{storeData.name}</h1>
              <Button variant="ghost" onClick={handleContinueShopping} className="flex items-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold">Checkout</h1>
              <Button variant="ghost" onClick={handleGoHome} className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full sm:w-auto">
              Complete Your Order
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
              </span>
            </h2>
          </div>

          {/* Checkout Content */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                storeName={storeData?.name || 'Store'}
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

export default Checkout;
