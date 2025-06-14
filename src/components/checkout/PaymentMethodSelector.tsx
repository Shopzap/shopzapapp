
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, CreditCard } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: 'cod' | 'online';
  onPaymentMethodChange: (method: 'cod' | 'online') => void;
  razorpayAvailable: boolean;
  paymentMode: 'test' | 'live';
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  razorpayAvailable,
  paymentMode
}) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium">Payment Method</h4>
      <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cod" id="cod" />
          <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
            <Truck className="h-4 w-4" />
            Cash on Delivery
          </Label>
        </div>
        
        {razorpayAvailable ? (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="online" id="online" />
            <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" />
              Pay Online {paymentMode === 'test' && <Badge variant="secondary">Test Mode</Badge>}
            </Label>
          </div>
        ) : (
          <div className="flex items-center space-x-2 opacity-50">
            <RadioGroupItem value="online" id="online-disabled" disabled />
            <Label htmlFor="online-disabled" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay Online
              <Badge variant="outline">Coming Soon</Badge>
            </Label>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};
