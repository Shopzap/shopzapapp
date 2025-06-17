
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from 'lucide-react';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { CheckoutSkeleton } from '@/components/skeletons/CheckoutSkeleton';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { useCheckout } from '@/hooks/useCheckout';
import FullScreenLoader from '@/components/checkout/FullScreenLoader';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    storeData,
    isLoading,
    paymentMethod,
    setPaymentMethod,
    razorpayAvailable,
    paymentMode,
    orderItems,
    subtotal,
    shipping,
    total,
    handlePlaceOrder,
    sellerAllowsCOD,
    sellerAllowsOnline
  } = useCheckout();

  // Add console logging to debug amount calculation
  React.useEffect(() => {
    console.log('Checkout amounts:', {
      subtotal,
      shipping,
      total,
      orderItems: orderItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity
      }))
    });
  }, [subtotal, shipping, total, orderItems]);

  return (
    <ResponsiveLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading && <FullScreenLoader message="Processing your order..." />}
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {!storeData ? (
            <CheckoutSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
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

              {/* Customer Information */}
              <div className="space-y-4">
                <CheckoutForm
                  onSubmit={handlePlaceOrder}
                  isLoading={isLoading}
                  total={total}
                  paymentMethod={paymentMethod}
                />

                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4" />
                    Secure checkout • Free shipping • Easy returns
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Checkout;
