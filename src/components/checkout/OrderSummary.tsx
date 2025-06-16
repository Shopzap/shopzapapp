
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    id: string;
    options: any;
    name: string;
  };
}

interface OrderSummaryProps {
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  storeName: string;
  paymentMethod: 'cod' | 'online';
  onPaymentMethodChange: (method: 'cod' | 'online') => void;
  razorpayAvailable: boolean;
  paymentMode: 'test' | 'live';
  sellerAllowsCOD?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderItems,
  subtotal,
  shipping,
  total,
  storeName,
  paymentMethod,
  onPaymentMethodChange,
  razorpayAvailable,
  paymentMode,
  sellerAllowsCOD = true
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatVariantName = (variant: any) => {
    if (!variant?.options) return '';
    
    const options = typeof variant.options === 'object' ? variant.options : {};
    return Object.values(options).join(' - ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
          <p className="text-sm text-muted-foreground">From {storeName}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Items */}
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground">
                      {formatVariantName(item.variant)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Qty: {item.quantity}</span>
                    <span>•</span>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">
                {shipping > 0 ? formatPrice(shipping) : 'Free'}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-t pt-4">
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onPaymentMethodChange={onPaymentMethodChange}
              razorpayAvailable={razorpayAvailable}
              paymentMode={paymentMode}
              sellerAllowsCOD={sellerAllowsCOD}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
