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
import { CreditCard, Truck, ArrowLeft, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCheckingCart, setIsCheckingCart] = useState(true);

  // Check cart and redirect if empty
  useEffect(() => {
    const checkCart = async () => {
      setIsCheckingCart(true);
      
      // Wait a moment for cart to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (cartItems.length === 0) {
        toast({
          title: "Cart is empty",
          description: "Redirecting to cart page...",
          variant: "destructive",
        });
        
        // Try to redirect to store cart if we have store context
        try {
          const storeContext = localStorage.getItem('shopzap_store_context');
          if (storeContext) {
            const parsed = JSON.parse(storeContext);
            navigate(`/store/${parsed.storeName}/cart`);
          } else {
            navigate('/cart');
          }
        } catch {
          navigate('/cart');
        }
        return;
      }
      
      setIsCheckingCart(false);
    };

    checkCart();
  }, [cartItems, navigate, toast]);

  useEffect(() => {
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

    if (!isCheckingCart) {
      loadStoreInfo();
    }
  }, [cartItems, isCheckingCart]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amount: number) => {
    try {
      console.log('Creating Razorpay order for amount:', amount);
      
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          isTestMode: paymentConfig.isTestMode
        }
      });

      console.log('Razorpay order response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to connect to payment service');
      }

      if (!data?.success) {
        console.error('Razorpay order creation failed:', data);
        const errorMessage = data?.error || 'Failed to create payment order';
        
        // Handle specific authentication errors
        if (data?.error?.includes('Authentication failed') || data?.error?.includes('API keys')) {
          throw new Error(`Payment gateway authentication failed${paymentConfig.isTestMode ? ' (TEST MODE)' : ''}. Please contact support - API keys may be incorrect.`);
        }
        
        // Handle configuration errors
        if (data?.error?.includes('not configured')) {
          throw new Error(`Payment gateway not configured${paymentConfig.isTestMode ? ' (TEST MODE)' : ''}. Please contact support to set up payments.`);
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Error in createRazorpayOrder:', error);
      throw error;
    }
  };

  const createOrderAfterPayment = async (paymentData: any) => {
    try {
      // Create order after successful payment
      const orderData = {
        storeId: cartItems[0].product.store_id,
        buyerName: customerInfo.fullName,
        buyerEmail: customerInfo.email,
        buyerPhone: customerInfo.phone,
        buyerAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`,
        totalPrice: getTotalPrice(),
        paymentMethod: 'online',
        paymentStatus: 'paid',
        paymentGateway: 'razorpay',
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceAtPurchase: Number(item.product.price)
        }))
      };

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          orderData
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to verify payment');
      }

      return data;
    } catch (error) {
      console.error('Error creating order after payment:', error);
      throw error;
    }
  };

  const handleRazorpayPayment = async () => {
    setPaymentError(null);
    
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      const error = "Payment gateway failed to load. Please check your internet connection and try again.";
      setPaymentError(error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create Razorpay order
      const razorpayOrderData = await createRazorpayOrder(getTotalPrice());
      
      // Use the key ID returned from the edge function or fallback to config
      const keyId = razorpayOrderData.keyId || paymentConfig.razorpay.keyId;
      
      if (!keyId || keyId.includes('YOUR_')) {
        throw new Error('Payment gateway not configured properly. Please contact support.');
      }
      
      const options = {
        key: keyId,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: storeInfo?.name || 'ShopZap Store',
        description: `Order from ${storeInfo?.name || 'ShopZap Store'}${paymentConfig.isTestMode ? ' (TEST MODE)' : ''}`,
        order_id: razorpayOrderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            console.log('Payment successful:', response);
            
            // Verify payment and create order
            const orderResult = await createOrderAfterPayment(response);
            
            // Clear cart and redirect to thank you page with payment ID
            clearCart();
            
            // Redirect to thank-you page with payment ID
            window.location.href = `/thank-you?payment_id=${response.razorpay_payment_id}&order_id=${orderResult.orderId}`;
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            setPaymentError(errorMessage);
            
            // Redirect to payment failed page
            window.location.href = `/payment-failed?reason=${encodeURIComponent(errorMessage)}`;
          } finally {
            setIsProcessing(false);
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
              description: `Payment was cancelled${paymentConfig.isTestMode ? ' (TEST MODE)' : ''}. Your order has not been placed.`,
              variant: "destructive",
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setPaymentError(errorMessage);
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const createCODOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          store_id: cartItems[0].product.store_id,
          buyer_name: customerInfo.fullName,
          buyer_email: customerInfo.email,
          buyer_phone: customerInfo.phone,
          buyer_address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`,
          total_price: getTotalPrice(),
          payment_method: 'cod',
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: data.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: Number(item.product.price)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send order confirmation email
      console.log('Sending email for COD order:', data.id);
      try {
        const emailResponse = await fetch('https://fyftegalhvigtrieldan.supabase.co/functions/v1/send-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZnRlZ2FsaHZpZ3RyaWVsZGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyODQyMjcsImV4cCI6MjA2Mjg2MDIyN30.5iVSqFm7E3c_EcmvGXlVw0rBlnxVY1rCR3y12-AXdAo`
          },
          body: JSON.stringify({
            buyerEmail: customerInfo.email,
            buyerName: customerInfo.fullName,
            orderId: data.id,
            products: cartItems.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: Number(item.product.price)
            })),
            totalAmount: getTotalPrice(),
            storeName: storeInfo?.name || 'ShopZap Store',
            sellerEmail: storeInfo?.business_email
          })
        });

        const emailResult = await emailResponse.json();
        console.log('Email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('Failed to send email, but order created successfully:', emailError);
        // Don't throw error - email failure shouldn't break order creation
      }

      return { orderId: data.id };
    } catch (error) {
      console.error('Error creating COD order:', error);
      throw error;
    }
  };

  const retryPayment = () => {
    setPaymentError(null);
    handleRazorpayPayment();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setIsProcessing(true);

    try {
      if (customerInfo.paymentMethod === 'online') {
        // For online payment, trigger Razorpay
        await handleRazorpayPayment();
      } else {
        // For COD, create order directly
        const orderResult = await createCODOrder();

        clearCart();
        
        // Redirect to thank-you page with order ID
        window.location.href = `/thank-you?order_id=${orderResult.orderId}`;
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error creating your order. Please try again.';
      
      setPaymentError(errorMessage);
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while checking cart
  if (isCheckingCart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  // Show empty cart message if no items (fallback - shouldn't reach here due to redirect)
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="text-center py-16">
          <CardContent>
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-400" />
            <h2 className="text-xl font-semibold mb-2">No items in cart</h2>
            <p className="text-gray-600 mb-6">Your cart is empty. Please add items before proceeding to checkout.</p>
            <div className="space-x-4">
              <Button onClick={() => navigate('/cart')}>
                Go to Cart
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
        {paymentConfig.isTestMode && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800 text-sm">
              <strong>TEST MODE:</strong> Use test card 4111 1111 1111 1111, any future expiry, CVV 123
            </p>
          </div>
        )}
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

                {/* Payment Error Display */}
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-red-800 font-medium">Payment Error</h4>
                        <p className="text-red-600 text-sm mt-1">{paymentError}</p>
                        {paymentConfig.isTestMode && (
                          <p className="text-orange-600 text-xs mt-2">
                            <strong>Note:</strong> You are in TEST MODE. Make sure your Razorpay test API keys are correctly configured.
                          </p>
                        )}
                      </div>
                      {customerInfo.paymentMethod === 'online' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={retryPayment}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            'Retry Payment'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

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
