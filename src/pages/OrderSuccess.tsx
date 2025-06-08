
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, Truck, Clock, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  orderId: string;
  orderItems: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    paymentMethod: string;
  };
  paymentInfo?: {
    paymentId?: string;
    paymentMethod: string;
    paymentTime?: string;
    paymentStatus: string;
  };
  estimatedDelivery: string;
}

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { orderId, orderItems, total, customerInfo, paymentInfo, estimatedDelivery } = location.state as LocationState;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          {paymentInfo?.paymentStatus === 'Paid' ? 'Payment Successful!' : 'Order Confirmed!'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {paymentInfo?.paymentStatus === 'Paid' 
            ? 'Your payment has been processed and your order is confirmed.'
            : 'Thank you for your order. We\'ll process it shortly.'}
        </p>
      </div>

      {/* Payment Information (for online payments) */}
      {paymentInfo?.paymentStatus === 'Paid' && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-700">Payment Status</p>
                <Badge className="mt-1 bg-green-600 hover:bg-green-700">✅ Paid</Badge>
              </div>
              {paymentInfo.paymentId && (
                <div>
                  <p className="font-medium text-green-700">Payment ID</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {paymentInfo.paymentId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentInfo.paymentId!, 'Payment ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <p className="font-medium text-green-700">Payment Method</p>
                <p className="text-green-600">{paymentInfo.paymentMethod}</p>
              </div>
              {paymentInfo.paymentTime && (
                <div>
                  <p className="font-medium text-green-700">Payment Time</p>
                  <p className="text-green-600">{paymentInfo.paymentTime}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">#{orderId.slice(-8)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(orderId, 'Order ID')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">{orderId}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Order Amount</p>
                <p className="font-semibold text-lg">₹{total.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Estimated Delivery</p>
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {estimatedDelivery}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-4">Items Ordered ({orderItems.length} items)</h4>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.image || 'https://placehold.co/50x50'} 
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer & Shipping Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping & Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Customer Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Name: </span>
                  <span>{customerInfo.fullName}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Email: </span>
                  <span>{customerInfo.email}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Phone: </span>
                  <span>{customerInfo.phone}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Shipping Address</h4>
              <div className="text-sm space-y-1">
                <p>{customerInfo.fullName}</p>
                <p>{customerInfo.address}</p>
                <p>{customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}</p>
                <p>Phone: {customerInfo.phone}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h4 className="font-semibold mb-2">Payment Method</h4>
            <div className="flex items-center gap-2">
              {paymentInfo?.paymentStatus === 'Paid' ? (
                <CreditCard className="h-4 w-4 text-green-600" />
              ) : (
                <Truck className="h-4 w-4 text-orange-600" />
              )}
              <span className="capitalize">{paymentInfo?.paymentMethod || customerInfo.paymentMethod}</span>
              {paymentInfo?.paymentStatus === 'Paid' && (
                <Badge className="ml-2 bg-green-600 hover:bg-green-700">Paid</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button 
          onClick={() => navigate(`/track-order/${orderId}`)}
          className="flex-1"
          size="lg"
        >
          <Package className="mr-2 h-4 w-4" />
          Track Your Order
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/store/demo')}
          className="flex-1"
          size="lg"
        >
          Continue Shopping
        </Button>
      </div>

      {/* What's Next Information */}
      <Card>
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Order Confirmed</h4>
              <p className="text-sm text-muted-foreground">
                Your order has been received and is being processed
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2">Preparing</h4>
              <p className="text-sm text-muted-foreground">
                We'll prepare your items and get them ready for shipping
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">On the way</h4>
              <p className="text-sm text-muted-foreground">
                Your order will be shipped and delivered to your address
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
