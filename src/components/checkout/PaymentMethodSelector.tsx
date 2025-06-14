
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, CreditCard, AlertCircle, Smartphone, Wallet } from 'lucide-react';

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
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Unavailable
              </Badge>
            </Label>
          </div>
        )}
      </RadioGroup>
      
      {razorpayAvailable && paymentMethod === 'online' && (
        <div className="text-sm text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Supported Payment Methods:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              UPI (GPay, PhonePe, Paytm)
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Credit/Debit Cards
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Net Banking
            </div>
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Digital Wallets
            </div>
          </div>
        </div>
      )}
      
      {!razorpayAvailable && (
        <div className="text-sm text-muted-foreground p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span>Online payment is currently unavailable. Please use Cash on Delivery.</span>
          </div>
        </div>
      )}
    </div>
  );
};
