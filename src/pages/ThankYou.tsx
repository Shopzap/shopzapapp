
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, Truck, Clock, Copy, Download, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface OrderDetails {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
  payment_gateway: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  created_at: string;
  paid_at: string;
  status: string;
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      id: string;
      name: string;
      image_url: string;
    };
  }[];
  stores: {
    name: string;
    username: string;
  };
}

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price_at_purchase,
              products (
                id,
                name,
                image_url
              )
            ),
            stores (
              name,
              username
            )
          `);

        // Fetch by payment ID or order ID
        if (paymentId) {
          query = query.eq('razorpay_payment_id', paymentId);
        } else if (orderId) {
          query = query.eq('id', orderId);
        } else {
          throw new Error('No payment ID or order ID provided');
        }

        const { data, error } = await query.single();

        if (error) {
          throw error;
        }

        setOrderDetails(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [paymentId, orderId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const calculateEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const downloadInvoice = () => {
    toast({
      title: "Invoice Download",
      description: "Invoice download feature coming soon!",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'We could not find your order details. Please check your payment ID or order ID.'}
          </p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const isPaidOrder = orderDetails.payment_status === 'paid';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Confetti-like success animation */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          {isPaidOrder ? '🎉 Payment Successful!' : '✅ Order Confirmed!'}
        </h1>
        <p className="text-lg text-muted-foreground">
          Thank you, <strong>{orderDetails.buyer_name}</strong>! Your order has been {isPaidOrder ? 'paid and ' : ''}confirmed.
        </p>
      </div>

      {/* Payment Information (for online payments) */}
      {isPaidOrder && (
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
              {orderDetails.razorpay_payment_id && (
                <div>
                  <p className="font-medium text-green-700">Payment ID</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {orderDetails.razorpay_payment_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(orderDetails.razorpay_payment_id, 'Payment ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <p className="font-medium text-green-700">Payment Method</p>
                <p className="text-green-600 capitalize">{orderDetails.payment_gateway || orderDetails.payment_method}</p>
              </div>
              {orderDetails.paid_at && (
                <div>
                  <p className="font-medium text-green-700">Payment Time</p>
                  <p className="text-green-600">{formatDateTime(orderDetails.paid_at)}</p>
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
              <Badge variant="secondary">#{orderDetails.id.slice(-8)}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(orderDetails.id, 'Order ID')}
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
                <p className="font-medium text-muted-foreground">Order Date</p>
                <p>{formatDateTime(orderDetails.created_at)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Order Amount</p>
                <p className="font-semibold text-lg">₹{Number(orderDetails.total_price).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Estimated Delivery</p>
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {calculateEstimatedDelivery()}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-4">Items Ordered ({orderDetails.order_items.length} items)</h4>
              <div className="space-y-3">
                {orderDetails.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.products.image_url || 'https://placehold.co/50x50'} 
                        alt={item.products.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{Number(item.price_at_purchase).toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{(Number(item.price_at_purchase) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Number(orderDetails.total_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span>₹{Number(orderDetails.total_price).toLocaleString()}</span>
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
                  <span>{orderDetails.buyer_name}</span>
                </div>
                {orderDetails.buyer_email && (
                  <div>
                    <span className="font-medium text-muted-foreground">Email: </span>
                    <span>{orderDetails.buyer_email}</span>
                  </div>
                )}
                {orderDetails.buyer_phone && (
                  <div>
                    <span className="font-medium text-muted-foreground">Phone: </span>
                    <span>{orderDetails.buyer_phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            {orderDetails.buyer_address && (
              <div>
                <h4 className="font-semibold mb-3">Shipping Address</h4>
                <div className="text-sm space-y-1">
                  <p>{orderDetails.buyer_name}</p>
                  <p>{orderDetails.buyer_address}</p>
                  {orderDetails.buyer_phone && <p>Phone: {orderDetails.buyer_phone}</p>}
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h4 className="font-semibold mb-2">Payment Method</h4>
            <div className="flex items-center gap-2">
              {isPaidOrder ? (
                <CreditCard className="h-4 w-4 text-green-600" />
              ) : (
                <Truck className="h-4 w-4 text-orange-600" />
              )}
              <span className="capitalize">{orderDetails.payment_gateway || orderDetails.payment_method}</span>
              {isPaidOrder && (
                <Badge className="ml-2 bg-green-600 hover:bg-green-700">Paid</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button 
          onClick={() => navigate(`/track-order?id=${orderDetails.id}`)}
          className="flex-1"
          size="lg"
        >
          <Package className="mr-2 h-4 w-4" />
          Track Your Order
        </Button>
        <Button 
          variant="outline" 
          onClick={downloadInvoice}
          className="flex-1"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/store/${orderDetails.stores.username}`)}
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
                Your order will be shipped and delivered in 5-7 days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;
