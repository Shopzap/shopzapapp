import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, Truck, Clock, Copy, Download, Loader2, User, MapPin, Phone, Mail, Store, Calendar, ExternalLink, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ResponsiveLayout from '@/components/ResponsiveLayout';

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
  estimated_delivery_date: string;
  special_instructions: string;
  order_notes: string;
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
    id: string;
    name: string;
    username: string;
    business_email: string;
    phone_number: string;
    address: string;
    tagline: string;
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
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching order with:', { paymentId, orderId });

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
              id,
              name,
              username,
              business_email,
              phone_number,
              address,
              tagline
            )
          `);

        // Try fetching by payment ID first, then by order ID
        if (paymentId) {
          console.log('Fetching by payment ID:', paymentId);
          const { data: paymentData, error: paymentError } = await query
            .eq('razorpay_payment_id', paymentId)
            .maybeSingle();

          if (paymentError) {
            console.error('Payment ID query error:', paymentError);
          }

          if (paymentData) {
            console.log('Found order by payment ID:', paymentData);
            setOrderDetails(paymentData);
            return;
          }
        }

        if (orderId) {
          console.log('Fetching by order ID:', orderId);
          const { data: orderData, error: orderError } = await query
            .eq('id', orderId)
            .maybeSingle();

          if (orderError) {
            console.error('Order ID query error:', orderError);
            throw orderError;
          }

          if (orderData) {
            console.log('Found order by order ID:', orderData);
            setOrderDetails(orderData);
            return;
          }
        }

        // If no specific IDs, try to get the most recent order
        if (!paymentId && !orderId) {
          console.log('No IDs provided, fetching most recent order');
          const { data: recentData, error: recentError } = await query
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (recentError) {
            console.error('Recent order query error:', recentError);
            throw recentError;
          }

          if (recentData) {
            console.log('Found recent order:', recentData);
            setOrderDetails(recentData);
            return;
          }
        }

        throw new Error('No order found');
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [paymentId, orderId]);

  useEffect(() => {
    if (orderDetails && !loading && !error) {
      toast({
        title: "🎉 Your order was placed successfully!",
        description: "We've sent a confirmation to your email.",
      });
    }
  }, [orderDetails, loading, error, toast]);

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

  const downloadInvoice = async () => {
    if (!orderDetails) return;
    
    setDownloadingInvoice(true);
    try {
      console.log('Generating invoice for order:', orderDetails.id);
      
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: {
          orderId: orderDetails.id,
          orderDetails: {
            id: orderDetails.id,
            buyer_name: orderDetails.buyer_name,
            buyer_email: orderDetails.buyer_email,
            buyer_phone: orderDetails.buyer_phone,
            buyer_address: orderDetails.buyer_address,
            total_price: orderDetails.total_price,
            created_at: orderDetails.created_at,
            order_items: orderDetails.order_items,
            stores: orderDetails.stores
          }
        }
      });

      if (error) {
        console.error('Invoice generation error:', error);
        throw error;
      }

      if (data?.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `invoice-${orderDetails.id.slice(-8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Invoice Downloaded",
          description: "Your invoice has been downloaded successfully.",
        });
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Error",
        description: "Unable to download invoice. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleNeedHelp = () => {
    // Redirect to help/support page
    window.open('https://shopzap.io/help', '_blank');
  };

  const handleCorrectOrder = () => {
    if (orderDetails) {
      const token = btoa(orderDetails.id + orderDetails.buyer_email + Date.now());
      navigate(`/correct-order/${orderDetails.id}?token=${token}`);
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your order details...</p>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !orderDetails) {
    return (
      <ResponsiveLayout>
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
      </ResponsiveLayout>
    );
  }

  const isPaidOrder = orderDetails.payment_status === 'paid';

  return (
    <ResponsiveLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Header */}
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

        {/* Payment Information */}
        {isPaidOrder && orderDetails && (
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

        {/* Enhanced Order Details Card */}
        {orderDetails && (
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Order Date</p>
                    <p>{formatDateTime(orderDetails.created_at)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Store</p>
                    <p className="font-semibold">{orderDetails.stores.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Estimated Delivery</p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {orderDetails.estimated_delivery_date 
                        ? new Date(orderDetails.estimated_delivery_date).toLocaleDateString()
                        : calculateEstimatedDelivery()
                      }
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Enhanced Items Section */}
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

                {/* Special Instructions */}
                {orderDetails.special_instructions && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Special Instructions</h4>
                      <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                        {orderDetails.special_instructions}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Buyer Information */}
        {orderDetails && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer & Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Name</p>
                        <p>{orderDetails.buyer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="break-all">{orderDetails.buyer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p>{orderDetails.buyer_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Address */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    <p className="font-medium mb-2">{orderDetails.buyer_name}</p>
                    <p className="whitespace-pre-line">{orderDetails.buyer_address}</p>
                    <p className="mt-2 text-muted-foreground">Phone: {orderDetails.buyer_phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Seller Information */}
        {orderDetails && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">{orderDetails.stores.name}</h4>
                  {orderDetails.stores.tagline && (
                    <p className="text-sm text-muted-foreground mb-3">{orderDetails.stores.tagline}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{orderDetails.stores.business_email}</span>
                    </div>
                    {orderDetails.stores.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{orderDetails.stores.phone_number}</span>
                      </div>
                    )}
                    {orderDetails.stores.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <span>{orderDetails.stores.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/store/${orderDetails.stores.username}`)}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Store
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            onClick={downloadInvoice}
            disabled={downloadingInvoice}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            {downloadingInvoice ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Invoice
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCorrectOrder}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            <Package className="h-4 w-4" />
            Correct Order
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => orderDetails && navigate(`/store/${orderDetails.stores.username}`)}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            Continue Shopping
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNeedHelp}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            <HelpCircle className="h-4 w-4" />
            Need Help?
          </Button>
        </div>

        {/* What's Next */}
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </ResponsiveLayout>
  );
};

export default ThankYou;
