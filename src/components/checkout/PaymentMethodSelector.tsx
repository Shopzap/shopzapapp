
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Truck, AlertCircle } from 'lucide-react';

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
  const availableOnline = sellerAllowsOnline && razorpayAvailable;
  const availableCOD = sellerAllowsCOD;

  // If neither payment method is available, show error
  if (!availableOnline && !availableCOD) {
    return (
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Payment Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            No payment methods are currently available. Please contact the seller.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup 
          value={paymentMethod} 
          onValueChange={(value) => onPaymentMethodChange(value as 'cod' | 'online')}
          className="space-y-3"
        >
          {/* Cash on Delivery */}
          {availableCOD && (
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="cod" id="cod" className="mt-1" />
              <div className="flex-1 min-w-0">
                <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer font-medium">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="text-sm sm:text-base">Cash on Delivery</span>
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Pay when your order arrives at your doorstep
                </p>
              </div>
            </div>
          )}

          {/* Online Payment */}
          {availableOnline && (
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="online" id="online" className="mt-1" />
              <div className="flex-1 min-w-0">
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer font-medium">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm sm:text-base">Online Payment</span>
                  {paymentMode === 'test' && (
                    <Badge variant="secondary" className="text-xs">
                      Test Mode
                    </Badge>
                  )}
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Pay securely using UPI, Cards, Net Banking & Wallets
                </p>
              </div>
            </div>
          )}
        </RadioGroup>

        {/* Payment method restrictions */}
        {!sellerAllowsCOD && !sellerAllowsOnline && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              This seller has not enabled any payment methods.
            </p>
          </div>
        )}

        {!sellerAllowsOnline && availableCOD && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Online payments are not available for this seller.
            </p>
          </div>
        )}

        {!razorpayAvailable && sellerAllowsOnline && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Online payment system is temporarily unavailable.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
