
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, Truck, Clock, Copy, Download, Edit, ExternalLink, ArrowRight, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
      image_url: string;
    };
  }>;
  stores: {
    name: string;
  };
}

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
      return;
    }

    fetchOrderData();
  }, [orderId, navigate]);

  const fetchOrderData = async () => {
    if (!orderId) return;
    
    try {
      console.log('Fetching order data for ID:', orderId);
      
      const { data: order, error } = await supabase
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
          ),
          stores (
            name
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      console.log('Order data fetched:', order);
      setOrderData(order);
    } catch (error) {
      console.error('Error in fetchOrderData:', error);
      toast({
        title: "Error",
        description: "Failed to load order details. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    
    setIsDownloadingInvoice(true);
    try {
      console.log('Generating invoice for order:', orderId);
      
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { orderId }
      });

      if (error) {
        console.error('Invoice generation error:', error);
        toast({
          title: "Invoice Error",
          description: "Unable to generate invoice at this time. Please contact the seller for assistance.",
          variant: "destructive"
        });
        return;
      }

      // Create blob and download
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId.slice(-8)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download invoice. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatAddress = (address: string) => {
    if (!address || address === 'undefined' || address.trim() === '') {
      return 'Address not provided';
    }
    return address;
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone === 'undefined' || phone.trim() === '') {
      return 'Phone not provided';
    }
    return phone;
  };

  const formatEmail = (email: string) => {
    if (!email || email === 'undefined' || email.trim() === '') {
      return 'Email not provided';
    }
    return email;
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!orderData) {
    return (
      <ResponsiveLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Order Not Found</CardTitle>
              <CardDescription>
                The order you're looking for could not be found. Please check your order ID and try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  const orderNumber = orderData.id.slice(-8);
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <ResponsiveLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
              disabled={isDownloadingInvoice}
              className="flex items-center justify-center gap-2 text-sm h-12"
              variant="default"
            >
              {isDownloadingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
              onClick={() => copyToClipboard(orderData.id, 'Order ID')}
              variant="outline" 
              className="flex items-center justify-center gap-2 text-sm h-12"
            >
              <Package className="h-4 w-4" />
              Copy Order ID
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline" 
              className="flex items-center justify-center gap-2 text-sm h-12"
            >
              <ArrowRight className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>

          {/* Payment Status */}
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
                  <p className="text-green-600 capitalize">
                    {orderData.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-green-700">Payment Status</p>
                  <Badge className={`mt-1 ${orderData.payment_status === 'paid' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                    {orderData.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending (COD)'}
                  </Badge>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-medium text-green-700">Order Time</p>
                  <p className="text-green-600 text-xs sm:text-sm">
                    {new Date(orderData.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    onClick={() => copyToClipboard(orderData.id, 'Order ID')}
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
                    <p className="font-semibold text-lg sm:text-xl">₹{Number(orderData.total_price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Items</p>
                    <p className="font-medium">{orderData.order_items.length} item{orderData.order_items.length > 1 ? 's' : ''}</p>
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
                    Items Ordered from {orderData.stores.name}
                  </h4>
                  <div className="space-y-3">
                    {orderData.order_items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <img 
                            src={item.products.image_url || 'https://placehold.co/60x60'} 
                            alt={item.products.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base line-clamp-2">{item.products.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{Number(item.price_at_purchase).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm sm:text-base">₹{(Number(item.price_at_purchase) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>₹{Number(orderData.total_price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-base sm:text-lg border-t pt-2">
                      <span>Total Amount</span>
                      <span>₹{Number(orderData.total_price).toLocaleString()}</span>
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
                      <span>{orderData.buyer_name || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Email: </span>
                      <span className="break-all">{formatEmail(orderData.buyer_email)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Phone: </span>
                      <span>{formatPhone(orderData.buyer_phone)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Delivery Address</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{orderData.buyer_name || 'Customer'}</p>
                    <p>{formatAddress(orderData.buyer_address)}</p>
                    <p>Phone: {formatPhone(orderData.buyer_phone)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    Your order is confirmed and being processed by {orderData.stores.name}
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
      </div>
    </ResponsiveLayout>
  );
};

export default ThankYou;
