
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
  sellerAllowsCOD?: boolean;
  sellerAllowsOnline?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  razorpayAvailable,
  paymentMode,
  sellerAllowsCOD = true,
  sellerAllowsOnline = true
}) => {
  // Check if we have any payment methods available
  const hasAnyPaymentMethod = sellerAllowsCOD || (sellerAllowsOnline && razorpayAvailable);
  const onlyOnlineAvailable = !sellerAllowsCOD && sellerAllowsOnline && razorpayAvailable;
  const onlyCODAvailable = sellerAllowsCOD && !sellerAllowsOnline;

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Payment Method</h4>
      
      {!hasAnyPaymentMethod && (
        <div className="text-sm text-muted-foreground p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>No payment methods are currently available. Please contact the seller.</span>
          </div>
        </div>
      )}

      {hasAnyPaymentMethod && (
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
          {sellerAllowsCOD ? (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                <Truck className="h-4 w-4" />
                Cash on Delivery
                {onlyCODAvailable && (
                  <Badge variant="secondary">Only Available</Badge>
                )}
              </Label>
            </div>
          ) : null}
          
          {sellerAllowsOnline ? (
            razorpayAvailable ? (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  Pay Online 
                  {paymentMode === 'test' && <Badge variant="secondary">Test Mode</Badge>}
                  {onlyOnlineAvailable && (
                    <Badge variant="secondary">Only Available</Badge>
                  )}
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
                    Setup Required
                  </Badge>
                </Label>
              </div>
            )
          ) : null}
        </RadioGroup>
      )}
      
      {sellerAllowsOnline && razorpayAvailable && paymentMethod === 'online' && (
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

      {!sellerAllowsCOD && sellerAllowsOnline && (
        <div className="text-sm text-muted-foreground p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span>This seller only accepts online payments. Cash on Delivery is not available.</span>
          </div>
        </div>
      )}

      {sellerAllowsCOD && !sellerAllowsOnline && (
        <div className="text-sm text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            <span>This seller only accepts Cash on Delivery payments.</span>
          </div>
        </div>
      )}
    </div>
  );
};
