
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  sellerAllowsOnline?: boolean;
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
  sellerAllowsCOD = true,
  sellerAllowsOnline = true
}) => {
  // Debug logging for amount verification
  React.useEffect(() => {
    const calculatedSubtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('Order Summary calculation check:', {
      providedSubtotal: subtotal,
      calculatedSubtotal,
      shipping,
      providedTotal: total,
      calculatedTotal: calculatedSubtotal + shipping,
      match: Math.abs((calculatedSubtotal + shipping) - total) < 0.01
    });
  }, [orderItems, subtotal, shipping, total]);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Summary</span>
          <Badge variant="outline">{storeName}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Items */}
        <div className="space-y-3">
          {orderItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';
                  }}
                />
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(item.variant.options).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join(', ')}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p>
                  <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method Selection */}
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
          razorpayAvailable={razorpayAvailable}
          paymentMode={paymentMode}
          sellerAllowsCOD={sellerAllowsCOD}
          sellerAllowsOnline={sellerAllowsOnline}
        />

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Amount will be charged in INR
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
