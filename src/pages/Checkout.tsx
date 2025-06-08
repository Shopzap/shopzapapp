
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ordersApi } from '@/services/api';
import { CreditCard, Truck, ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { paymentConfig } from '@/config/payment';

// Add Razorpay to window type
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();

  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const loadStoreInfo = async () => {
      if (cartItems.length > 0) {
        const { data: store } = await supabase
          .from('stores')
          .select('*')
          .eq('id', cartItems[0].product.store_id)
          .single();
        setStoreInfo(store);
      }
    };

    loadStoreInfo();
  }, [cartItems, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderData: any) => {
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      toast({
        title: "Error",
        description: "Payment gateway failed to load. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const options = {
      key: paymentConfig.razorpay.keyId,
      amount: Math.round(getTotalPrice() * 100), // Amount in paise
      currency: 'INR',
      name: storeInfo?.name || 'Store',
      description: `Order from ${storeInfo?.name || 'Store'}`,
      order_id: orderData.razorpayOrderId,
      handler: async function (response: any) {
        try {
          // Verify payment with backend
          const verifyResponse = await supabase.functions.invoke('verify-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId
            }
          });

          if (verifyResponse.data?.success) {
            clearCart();
            
            // Navigate to success page with payment info
            navigate('/order-success', {
              state: {
                orderId: orderData.orderId,
                orderItems: cartItems.map(item => ({
                  id: item.product.id,
                  name: item.product.name,
                  price: item.product.price,
                  quantity: item.quantity,
                  image: item.product.image_url
                })),
                total: getTotalPrice(),
                customerInfo,
                paymentInfo: {
                  paymentId: response.razorpay_payment_id,
                  paymentMethod: 'Razorpay',
                  paymentTime: new Date().toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }),
                  paymentStatus: 'Paid'
                },
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })
              }
            });
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast({
            title: "Payment Verification Failed",
            description: "There was an issue verifying your payment. Please contact support.",
            variant: "destructive",
          });
        }
      },
      prefill: {
        name: customerInfo.fullName,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      theme: {
        color: storeInfo?.theme?.primary_color || '#3B82F6'
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. Your order has not been placed.",
            variant: "destructive",
          });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create order using the API
      const orderResult = await ordersApi.createOrder({
        storeId: cartItems[0].product.store_id,
        buyerName: customerInfo.fullName,
        buyerEmail: customerInfo.email,
        buyerPhone: customerInfo.phone,
        buyerAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`,
        totalPrice: getTotalPrice(),
        paymentMethod: customerInfo.paymentMethod,
        paymentStatus: customerInfo.paymentMethod === 'online' ? 'pending' : 'pending',
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceAtPurchase: Number(item.product.price)
        }))
      });

      if (customerInfo.paymentMethod === 'online') {
        // For online payment, trigger Razorpay
        await handleRazorpayPayment({
          orderId: orderResult.orderId,
          razorpayOrderId: `order_${orderResult.orderId.slice(-10)}`
        });
      } else {
        // For COD, redirect to success page
        clearCart();
        navigate('/order-success', {
          state: {
            orderId: orderResult.orderId,
            orderItems: cartItems.map(item => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.image_url
            })),
            total: getTotalPrice(),
            customerInfo,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })
          }
        });
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Review your order and complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter your details for order delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={customerInfo.state}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={customerInfo.zipCode}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Choose your preferred payment option</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={customerInfo.paymentMethod}
                      onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
                          <Truck className="mr-2 h-4 w-4" />
                          Cash on Delivery
                          <Badge variant="secondary" className="ml-auto">Free</Badge>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex items-center cursor-pointer flex-1">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Online Payment (Razorpay)
                          <Badge variant="default" className="ml-auto">Secure</Badge>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {customerInfo.paymentMethod === 'online' ? (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay ₹{getTotalPrice().toLocaleString()} Now
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Place Order
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{cartItems.length} items in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={item.product.image_url || 'https://placehold.co/50x50'} 
                        alt={item.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Information */}
          {storeInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  {storeInfo.logo_image && (
                    <img 
                      src={storeInfo.logo_image} 
                      alt={storeInfo.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{storeInfo.name}</h3>
                    <p className="text-sm text-muted-foreground">{storeInfo.description}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/store/${storeInfo.username}`}>
                      Visit Store
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/store/${storeInfo.username}/about`}>
                      About Store
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
