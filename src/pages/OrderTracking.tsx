
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderDetails {
  id: string;
  buyer_name: string;
  buyer_email: string | null;
  buyer_phone: string | null;
  buyer_address: string | null;
  status: string;
  total_price: number;
  tracking_number: string | null;
  shipping_carrier: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
      image_url: string | null;
    };
  }[];
}

interface StatusHistory {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const searchOrder = async () => {
    if (!orderId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter an order ID to search.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setOrderDetails(null);
    setStatusHistory([]);

    try {
      // Fetch order details with items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        setNotFound(true);
        toast({
          title: "Order Not Found",
          description: "No order found with the provided ID. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      setOrderDetails(orderData);

      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (!historyError && historyData) {
        setStatusHistory(historyData);
      }

    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Search Failed",
        description: "An error occurred while searching for the order.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchOrder();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">
          Enter your order ID to get real-time updates on your package
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Order Lookup
          </CardTitle>
          <CardDescription>
            Enter your order ID to track your package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="e.g., ORD-1234567890"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchOrder} 
                disabled={isLoading}
                className="h-10"
              >
                {isLoading ? 'Searching...' : 'Track Order'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Not Found */}
      {notFound && (
        <Card className="text-center">
          <CardContent className="pt-6">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              We couldn't find an order with that ID. Please check your order confirmation email and try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      {orderDetails && (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{orderDetails.id.slice(-8)}</CardTitle>
                  <CardDescription>
                    Placed on {new Date(orderDetails.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(orderDetails.status)}>
                  {orderDetails.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{orderDetails.buyer_name}</span>
                    </div>
                    {orderDetails.buyer_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{orderDetails.buyer_email}</span>
                      </div>
                    )}
                    {orderDetails.buyer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{orderDetails.buyer_phone}</span>
                      </div>
                    )}
                    {orderDetails.buyer_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{orderDetails.buyer_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h4 className="font-semibold mb-3">Shipping Information</h4>
                  <div className="space-y-2 text-sm">
                    {orderDetails.tracking_number && (
                      <div>
                        <span className="font-medium">Tracking Number: </span>
                        <span className="font-mono">{orderDetails.tracking_number}</span>
                      </div>
                    )}
                    {orderDetails.shipping_carrier && (
                      <div>
                        <span className="font-medium">Carrier: </span>
                        <span>{orderDetails.shipping_carrier}</span>
                      </div>
                    )}
                    {orderDetails.estimated_delivery_date && (
                      <div>
                        <span className="font-medium">Estimated Delivery: </span>
                        <span>{new Date(orderDetails.estimated_delivery_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderDetails.order_items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <img 
                      src={item.products.image_url || 'https://placehold.co/80x80'} 
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.products.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price_at_purchase.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{orderDetails.total_price.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>
                Track the progress of your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Status */}
                <div className="flex items-center gap-3 p-3 border-l-4 border-primary bg-primary/5">
                  {getStatusIcon(orderDetails.status)}
                  <div>
                    <p className="font-semibold capitalize">{orderDetails.status}</p>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                  </div>
                </div>

                {/* Status History */}
                {statusHistory.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Status History</h4>
                    {statusHistory.map((history) => (
                      <div key={history.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        {getStatusIcon(history.status)}
                        <div className="flex-1">
                          <p className="font-medium capitalize">{history.status}</p>
                          {history.notes && (
                            <p className="text-sm text-muted-foreground">{history.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(history.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Default Timeline for orders without history */}
                {statusHistory.length === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(orderDetails.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
