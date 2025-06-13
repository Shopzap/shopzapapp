
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, Truck, Clock, Copy, Download, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ResponsiveLayout from '@/components/ResponsiveLayout';

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

  const handleTrackOrder = () => {
    navigate(`/track-order/${orderId}`);
  };

  const handleDownloadInvoice = () => {
    // Mock invoice download - in real app, this would generate and download PDF
    toast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded successfully.",
    });
  };

  const handleCorrectOrder = () => {
    toast({
      title: "Contact Support",
      description: "Please contact our support team to make corrections to your order.",
    });
  };

  return (
    <ResponsiveLayout maxWidth="7xl" padding="md">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">
            {paymentInfo?.paymentStatus === 'Paid' ? 'Payment Successful!' : 'Order Confirmed!'}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            {paymentInfo?.paymentStatus === 'Paid' 
              ? 'Your payment has been processed and your order is confirmed.'
              : 'Thank you for your order. We\'ll process it shortly.'}
          </p>
        </div>

        {/* Payment Information */}
        {paymentInfo?.paymentStatus === 'Paid' && (
          <Card className="mb-4 sm:mb-6 border-green-200 bg-green-50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg sm:text-xl">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-700">Payment Status</p>
                  <Badge className="mt-1 bg-green-600 hover:bg-green-700">✅ Paid</Badge>
                </div>
                {paymentInfo.paymentId && (
                  <div>
                    <p className="font-medium text-green-700">Payment ID</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                        {paymentInfo.paymentId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paymentInfo.paymentId!, 'Payment ID')}
                        className="h-7 w-7 p-0"
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
                    <p className="text-green-600 text-xs sm:text-sm">{paymentInfo.paymentTime}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-lg sm:text-xl">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Order Details
              </span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Badge variant="secondary" className="text-xs">#{orderId.slice(-8)}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(orderId, 'Order ID')}
                  className="h-7 w-7 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Order ID</p>
                  <p className="font-mono text-xs sm:text-sm break-all">{orderId}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Order Amount</p>
                  <p className="font-semibold text-lg sm:text-xl">₹{total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Estimated Delivery</p>
                  <p className="flex items-center gap-1 text-xs sm:text-sm">
                    <Clock className="h-3 w-3" />
                    {estimatedDelivery}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                  Items Ordered ({orderItems.length} items)
                </h4>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <img 
                          src={item.image || 'https://placehold.co/50x50'} 
                          alt={item.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            ₹{item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>₹{orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-base sm:text-lg border-t pt-2">
                    <span>Total Amount</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Shipping Information */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              Shipping & Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Customer Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Name: </span>
                    <span>{customerInfo.fullName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Email: </span>
                    <span className="break-all">{customerInfo.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Phone: </span>
                    <span>{customerInfo.phone}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Shipping Address</h4>
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
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Payment Method</h4>
              <div className="flex items-center gap-2">
                {paymentInfo?.paymentStatus === 'Paid' ? (
                  <CreditCard className="h-4 w-4 text-green-600" />
                ) : (
                  <Truck className="h-4 w-4 text-orange-600" />
                )}
                <span className="capitalize text-sm">{paymentInfo?.paymentMethod || customerInfo.paymentMethod}</span>
                {paymentInfo?.paymentStatus === 'Paid' && (
                  <Badge className="ml-2 bg-green-600 hover:bg-green-700 text-xs">Paid</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            onClick={handleTrackOrder}
            className="flex items-center justify-center gap-2 text-sm"
            size="lg"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center gap-2 text-sm"
            size="lg"
          >
            <Download className="h-4 w-4" />
            Invoice PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCorrectOrder}
            className="flex items-center justify-center gap-2 text-sm"
            size="lg"
          >
            <Edit className="h-4 w-4" />
            Correction
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/store/demo')}
            className="flex items-center justify-center gap-2 text-sm"
            size="lg"
          >
            Continue Shopping
          </Button>
        </div>

        {/* What's Next */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Order Confirmed</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your order has been received and is being processed
                </p>
              </div>
              
              <div className="text-center p-3 sm:p-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Preparing</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We'll prepare your items and get them ready for shipping
                </p>
              </div>
              
              <div className="text-center p-3 sm:p-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">On the way</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your order will be shipped and delivered to your address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default OrderSuccess;
