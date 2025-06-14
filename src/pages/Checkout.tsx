
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, User, Truck, CreditCard, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ordersApi } from '@/services/api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { paymentConfig } from '@/config/payment';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { CheckoutSkeleton } from '@/components/skeletons/CheckoutSkeleton';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  specialInstructions?: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().regex(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)(?!0+\s?\.?$)(?!0+\s?$)(\d{10})$/, {
    message: "Please enter a valid 10-digit phone number.",
  }),
  address: z.string().min(5, {
    message: "Address is required",
  }),
  city: z.string().min(2, {
    message: "City is required",
  }),
  state: z.string().min(2, {
    message: "State is required",
  }),
  zipCode: z.string().regex(/^[0-9]{6}$/, {
    message: "Please enter a valid 6-digit ZIP code",
  }),
  specialInstructions: z.string().optional(),
});

const Checkout: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [storeData, setStoreData] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  const [razorpayAvailable, setRazorpayAvailable] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'test' | 'live'>('test');

  // Get order items from location state or use mock data
  const [orderItems, setOrderItems] = useState<OrderItem[]>(location.state?.orderItems || [
    {
      id: 1,
      name: 'Wireless Earbuds',
      price: 1999,
      quantity: 1,
      image: 'https://placehold.co/80x80'
    },
    {
      id: 2,
      name: 'Phone Case',
      price: 499,
      quantity: 2,
      image: 'https://placehold.co/80x80'
    }
  ]);

  const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      specialInstructions: "",
    },
  });

  // Check Razorpay availability on mount
  useEffect(() => {
    const checkRazorpayAvailability = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-razorpay-keys');
        if (!error && data?.available) {
          setRazorpayAvailable(true);
          setPaymentMode(data.mode || 'test');
        }
      } catch (error) {
        console.log('Razorpay not configured');
      }
    };

    checkRazorpayAvailability();
  }, []);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Replace 'demo-store-id' with dynamic store ID if needed
        setStoreData({ id: 'demo-store-id', name: 'Demo Store' });
      } catch (error) {
        console.error('Failed to fetch store data:', error);
        toast({
          title: "Store Error",
          description: "Failed to load store information. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchStoreData();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (values: z.infer<typeof formSchema>) => {
    if (orderItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create order in database
      const orderData = {
        storeId: storeData?.id || 'demo-store-id', // This should come from context/props
        buyerName: values.fullName,
        buyerEmail: values.email,
        buyerPhone: values.phone,
        buyerAddress: `${values.address}, ${values.city}, ${values.state} ${values.zipCode}`,
        totalPrice: total,
        items: orderItems.map(item => ({
          productId: `product-${item.id}`, // This should be the actual product ID
          quantity: item.quantity,
          priceAtPurchase: item.price
        }))
      };

      if (paymentMethod === 'online') {
        const razorpay = await loadRazorpay();

        if (!razorpay) {
          toast({
            title: "Payment Error",
            description: "Razorpay SDK failed to load. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const { data: razorpayOrder, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
          body: {
            amount: total * 100, // Razorpay uses paise
            currency: 'INR',
            receipt: `order_${Date.now()}`
          }
        });

        if (razorpayError) {
          console.error('Razorpay order creation failed:', razorpayError);
          toast({
            title: "Payment Error",
            description: "Failed to initiate online payment. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const options = {
          key: paymentConfig.razorpay.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: storeData?.name || 'ShopZap Store',
          description: 'Secure online payment',
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            // Verify payment signature on the client-side
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-razorpay-signature', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: razorpayOrder.id,
                razorpay_signature: response.razorpay_signature
              }
            });

            if (verificationError) {
              console.error('Razorpay signature verification failed:', verificationError);
              toast({
                title: "Payment Verification Failed",
                description: "Payment could not be verified. Please contact support.",
                variant: "destructive"
              });
              setIsLoading(false);
              return;
            }

            // Payment successful, create order in database
            const apiResponse = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await (await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                ...orderData,
                paymentMethod: 'online',
                razorpayPaymentId: response.razorpay_payment_id
              })
            });

            if (!apiResponse.ok) {
              throw new Error('Failed to create order after payment');
            }

            const result = await apiResponse.json();

            // Navigate to order success page with real order details
            navigate('/order-success', {
              state: {
                orderId: result.orderId,
                orderItems,
                total,
                customerInfo: values,
                paymentInfo: {
                  paymentId: response.razorpay_payment_id,
                  paymentMethod: 'Razorpay',
                  paymentTime: new Date().toISOString(),
                  paymentStatus: 'Paid'
                },
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()
              }
            });
          },
          prefill: {
            name: values.fullName,
            email: values.email,
            contact: values.phone
          },
          notes: {
            order_id: razorpayOrder.orderId
          },
          theme: {
            color: '#7b3fe4'
          }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          console.error('Razorpay payment failed:', response);
          toast({
            title: "Payment Failed",
            description: "Your payment failed. Please try again or use a different payment method.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
        rzp1.open();
      } else {
        const apiResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await (await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(orderData)
        });

        if (!apiResponse.ok) {
          throw new Error('Failed to create order');
        }

        const result = await apiResponse.json();
        
        // Navigate to order success page with real order details
        navigate('/order-success', {
          state: {
            orderId: result.orderId,
            orderItems,
            total,
            customerInfo: values,
            paymentInfo: {
              paymentMethod: 'Cash on Delivery',
              paymentStatus: 'Pending'
            },
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()
          }
        });
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: "Order Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveLayout maxWidth="7xl" padding="md">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {!storeData ? (
          <CheckoutSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review your items from {storeData.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Order Total */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <h4 className="font-medium">Payment Method</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="cod" 
                        id="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                        <Truck className="h-4 w-4" />
                        Cash on Delivery
                      </Label>
                    </div>
                    
                    {razorpayAvailable ? (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="online" 
                          id="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                        />
                        <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          Pay Online {paymentMode === 'test' && <Badge variant="secondary">Test Mode</Badge>}
                        </Label>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 opacity-50">
                        <RadioGroupItem value="online" id="online-disabled" disabled />
                        <Label htmlFor="online-disabled" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Pay Online
                          <Badge variant="outline">Coming Soon</Badge>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Enter your details for delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handlePlaceOrder)} className="space-y-4">
                    {/* Full Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              {...field}
                              autoComplete="name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email address" 
                              {...field}
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="Enter your phone number" 
                              {...field}
                              autoComplete="tel"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full address" 
                              {...field}
                              autoComplete="street-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your city" 
                              {...field}
                              autoComplete="address-level2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your state" 
                              {...field}
                              autoComplete="address-level1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ZIP Code */}
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Pin Code *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your ZIP/Pin code" 
                              {...field}
                              autoComplete="postal-code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Special Instructions */}
                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special delivery instructions..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Place Order Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Order...
                        </>
                      ) : paymentMethod === 'online' ? (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Pay ₹{total.toLocaleString()} Online
                        </>
                      ) : (
                        <>
                          <Truck className="h-5 w-5 mr-2" />
                          Place Order - ₹{total.toLocaleString()}
                        </>
                      )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4" />
                        Secure checkout • Free shipping • Easy returns
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default Checkout;
