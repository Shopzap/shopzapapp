
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck, MapPin, Clock, CheckCircle } from 'lucide-react';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const orderIdFromQuery = searchParams.get('order');
  const { toast } = useToast();
  
  const [trackingOrderId, setTrackingOrderId] = useState(orderId || orderIdFromQuery || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackOrder = async () => {
    if (!trackingOrderId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID to track your order.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate order tracking - replace with actual API call
      const mockOrderData = {
        id: trackingOrderId,
        status: 'shipped',
        buyerName: 'John Doe',
        storeName: 'Tech Store',
        totalAmount: 2498,
        orderDate: '2024-01-15',
        estimatedDelivery: '2024-01-20',
        trackingNumber: 'TRK123456789',
        carrier: 'India Post',
        items: [
          { name: 'Wireless Earbuds', quantity: 1, price: 1999 },
          { name: 'Phone Case', quantity: 1, price: 499 }
        ],
        timeline: [
          { status: 'Order Placed', date: '2024-01-15 10:30 AM', completed: true },
          { status: 'Order Confirmed', date: '2024-01-15 11:15 AM', completed: true },
          { status: 'Order Shipped', date: '2024-01-16 09:00 AM', completed: true },
          { status: 'Out for Delivery', date: '', completed: false },
          { status: 'Delivered', date: '', completed: false }
        ]
      };

      setOrderData(mockOrderData);
      toast({
        title: "Order Found",
        description: "Your order details have been loaded successfully."
      });
    } catch (error) {
      toast({
        title: "Order Not Found",
        description: "Unable to find order with the provided ID. Please check and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (trackingOrderId) {
      trackOrder();
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Track Your Order</h1>
        
        {/* Order ID Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Enter Order ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={trackingOrderId}
                onChange={(e) => setTrackingOrderId(e.target.value)}
                placeholder="Enter your order ID"
                className="flex-1"
              />
              <Button onClick={trackOrder} disabled={loading}>
                {loading ? 'Tracking...' : 'Track Order'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{orderData.id.slice(-8)}</span>
                  <Badge className={getStatusColor(orderData.status)}>
                    {orderData.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Store:</strong> {orderData.storeName}</p>
                    <p><strong>Order Date:</strong> {orderData.orderDate}</p>
                    <p><strong>Total Amount:</strong> ₹{orderData.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p><strong>Estimated Delivery:</strong> {orderData.estimatedDelivery}</p>
                    {orderData.trackingNumber && (
                      <p><strong>Tracking Number:</strong> {orderData.trackingNumber}</p>
                    )}
                    {orderData.carrier && (
                      <p><strong>Carrier:</strong> {orderData.carrier}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.timeline.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                          {step.status}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
