import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, Truck, Clock, Copy, Download, Edit, ExternalLink, ArrowRight } from 'lucide-react';
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
  
  const { orderId, orderItems, total, customerInfo, paymentInfo, estimatedDelivery } = (location.state as LocationState) || {};

  // Redirect if no order data
  useEffect(() => {
    if (!orderId || !orderItems) {
      navigate('/', { replace: true });
    }
  }, [orderId, orderItems, navigate]);

  const orderNumber = orderId?.slice(-8) || '';

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
    navigate(`/invoice/${orderId}`);
  };

  const handleCorrectOrder = () => {
    navigate(`/correct-order/${orderId}`);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (!orderId || !orderItems) {
    return null;
  }

  return (
    <ResponsiveLayout maxWidth="7xl" padding="md">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Thank you for your order. We've sent a confirmation email with all the details.
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Order #{orderNumber}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center gap-2 text-sm h-12"
            variant="default"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </Button>
          <Button 
            onClick={handleTrackOrder}
            variant="outline" 
            className="flex items-center justify-center gap-2 text-sm h-12"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Button>
          <Button 
            onClick={handleCorrectOrder}
            variant="outline" 
            className="flex items-center justify-center gap-2 text-sm h-12"
          >
            <Edit className="h-4 w-4" />
            Correct Order
          </Button>
        </div>

        {/* Payment Status */}
        {paymentInfo && (
          <Card className="mb-4 sm:mb-6 border-green-200 bg-green-50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg sm:text-xl">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-700">Payment Method</p>
                  <p className="text-green-600 capitalize">{paymentInfo.paymentMethod}</p>
                </div>
                <div>
                  <p className="font-medium text-green-700">Payment Status</p>
                  <Badge className={`mt-1 ${paymentInfo.paymentStatus === 'Paid' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                    {paymentInfo.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending (COD)'}
                  </Badge>
                </div>
                {paymentInfo.paymentTime && (
                  <div className="sm:col-span-2">
                    <p className="font-medium text-green-700">Order Time</p>
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
                <Badge variant="secondary" className="text-xs">#{orderNumber}</Badge>
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
                  <p className="font-medium text-muted-foreground">Order Amount</p>
                  <p className="font-semibold text-lg sm:text-xl">₹{total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Items</p>
                  <p className="font-medium">{orderItems.length} item{orderItems.length > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Estimated Delivery</p>
                  <p className="flex items-center gap-1 text-xs sm:text-sm font-medium">
                    <Clock className="h-3 w-3" />
                    {estimatedDelivery}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                  Items Ordered
                </h4>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString()}
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
                    <span className="text-green-600 font-medium">Free</span>
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

        {/* Customer Information */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              Delivery Information
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
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Delivery Address</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{customerInfo.fullName}</p>
                  <p>{customerInfo.address}</p>
                  <p>{customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}</p>
                  <p>Phone: {customerInfo.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Correction Notice */}
        <Card className="mb-6 sm:mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <Edit className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Need to make changes?</h4>
                <p className="text-orange-700 text-sm mb-3">
                  You can correct your order details (address, phone, etc.) within 24 hours of placing the order.
                </p>
                <Button
                  onClick={handleCorrectOrder}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Correct Order Details
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Shopping */}
        <div className="text-center mb-6 sm:mb-8">
          <Button 
            onClick={handleContinueShopping}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
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
                  Your order is confirmed and being processed by the seller
                </p>
              </div>
              
              <div className="text-center p-3 sm:p-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Preparing</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Items are being packed and prepared for shipping
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
