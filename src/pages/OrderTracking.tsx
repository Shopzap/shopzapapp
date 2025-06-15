import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Truck, CheckCircle, Clock, ArrowLeft, Search, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  total_price: number;
  status: string;
  payment_status: string;
  payment_method: string;
  tracking_number: string;
  shipping_carrier: string;
  estimated_delivery_date: string;
  created_at: string;
  shipped_at: string;
  delivered_at: string;
  order_items: OrderItem[];
  stores: {
    name: string;
    username: string;
    logo_image: string;
  };
}

const OrderTracking = () => {
  const { orderId: orderIdFromParams } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderIdFromQuery = searchParams.get('order_id');
  const effectiveOrderId = orderIdFromParams || orderIdFromQuery;

  const [searchOrderId, setSearchOrderId] = useState(effectiveOrderId || '');

  useEffect(() => {
    if (effectiveOrderId) {
      fetchOrder(effectiveOrderId);
    } else {
      setLoading(false);
    }
  }, [effectiveOrderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url)
          ),
          stores (name, username, logo_image)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Order Not Found",
          description: "We couldn't find an order with that ID.",
          variant: "destructive",
        });
        setOrder(null);
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "There was an error fetching your order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderId.trim()) {
      window.location.href = `/track-order/${searchOrderId.trim()}`;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOrderProgress = () => {
    if (!order) return [];
    
    const steps = [
      {
        title: 'Order Placed',
        description: 'Your order has been confirmed',
        icon: CheckCircle,
        completed: true,
        date: new Date(order.created_at).toLocaleDateString()
      },
      {
        title: 'Processing',
        description: 'We are preparing your items',
        icon: Package,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()),
        date: order.status === 'processing' ? new Date().toLocaleDateString() : null
      },
      {
        title: 'Shipped',
        description: 'Your order is on the way',
        icon: Truck,
        completed: ['shipped', 'delivered'].includes(order.status.toLowerCase()),
        date: order.shipped_at ? new Date(order.shipped_at).toLocaleDateString() : null
      },
      {
        title: 'Delivered',
        description: 'Your order has been delivered',
        icon: CheckCircle,
        completed: order.status.toLowerCase() === 'delivered',
        date: order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : null
      }
    ];

    return steps;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!effectiveOrderId || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Track Your Order</CardTitle>
            <CardDescription>Enter your order ID to track your shipment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  placeholder="Enter your order ID"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = getOrderProgress();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Order Tracking</h1>
        <p className="text-muted-foreground">Track your order status and delivery progress</p>
      </div>

      {/* Order Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Order #{order.id.slice(-8)}</CardTitle>
              <CardDescription>
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </CardDescription>
            </div>
            <div className="text-right space-y-2">
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status.toUpperCase()}
              </Badge>
              <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                {order.payment_status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Order Amount</p>
              <p className="font-semibold text-lg">₹{order.total_price.toLocaleString()}</p>
            </div>
            {order.tracking_number && (
              <div>
                <p className="font-medium text-muted-foreground">Tracking Number</p>
                <p className="font-mono">{order.tracking_number}</p>
              </div>
            )}
            {order.estimated_delivery_date && (
              <div>
                <p className="font-medium text-muted-foreground">Expected Delivery</p>
                <p>{new Date(order.estimated_delivery_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {progress.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                          {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {step.date && (
                        <p className="text-sm text-muted-foreground">{step.date}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{order.order_items.length} items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={item.products.image_url || 'https://placehold.co/50x50'} 
                    alt={item.products.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.products.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.price_at_purchase.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Delivery Address</h4>
              <div className="text-sm space-y-1">
                <p>{order.buyer_name}</p>
                <p>{order.buyer_address}</p>
                <p>Phone: {order.buyer_phone}</p>
                {order.buyer_email && <p>Email: {order.buyer_email}</p>}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Payment Information</h4>
              <div className="text-sm space-y-1">
                <p>Method: {order.payment_method?.toUpperCase() || 'COD'}</p>
                <p>Status: 
                  <Badge 
                    variant={getPaymentStatusBadgeVariant(order.payment_status)} 
                    className="ml-2"
                  >
                    {order.payment_status?.toUpperCase() || 'PENDING'}
                  </Badge>
                </p>
                <p>Total: ₹{order.total_price.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {order.stores.logo_image && (
                <img 
                  src={order.stores.logo_image} 
                  alt={order.stores.name}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold">{order.stores.name}</h3>
                <p className="text-sm text-muted-foreground">@{order.stores.username}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/store/${order.stores.username}`}>
                <ExternalLink className="mr-2 h-3 w-3" />
                Visit Store
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTracking;
