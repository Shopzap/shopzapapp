import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package } from 'lucide-react';

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
  estimatedDelivery: string;
}

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { orderId, orderItems, total, customerInfo, estimatedDelivery } = location.state as LocationState;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge variant="secondary">#{orderId}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Order ID</p>
                <p className="font-mono">{orderId}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Estimated Delivery</p>
                <p>{estimatedDelivery}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-3">Items Ordered</h4>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.image || 'https://placehold.co/40x40'} 
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
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
            <div>
              <span className="font-medium text-muted-foreground">Address: </span>
              <span>{customerInfo.address}, {customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Payment Method: </span>
              <span className="capitalize">{customerInfo.paymentMethod}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate(`/track-order?orderId=${orderId}`)}
          className="flex-1"
        >
          <Package className="mr-2 h-4 w-4" />
          Track Your Order
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/store/demo')}
          className="flex-1"
        >
          Continue Shopping
        </Button>
      </div>

      {/* Additional Information */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You'll receive an email confirmation shortly</li>
          <li>• We'll send updates as your order is processed</li>
          <li>• Use the tracking link above to monitor your shipment</li>
          <li>• Contact us if you have any questions about your order</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderSuccess;
