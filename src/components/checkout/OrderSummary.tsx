
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from 'lucide-react';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderSummaryProps {
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  storeName?: string;
  paymentMethod: 'cod' | 'online';
  onPaymentMethodChange: (method: 'cod' | 'online') => void;
  razorpayAvailable: boolean;
  paymentMode: 'test' | 'live';
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
  paymentMode
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
        <CardDescription>
          Review your items from {storeName || 'Demo Store'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-16 h-16 rounded object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                ₹{item.price.toLocaleString()} × {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          </div>
        ))}

        <Separator />

        {/* Order Total */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
          razorpayAvailable={razorpayAvailable}
          paymentMode={paymentMode}
        />
      </CardContent>
    </Card>
  );
};
