
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Minus, Trash2, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
import ResponsiveLayout from '@/components/ResponsiveLayout';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Checkout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get order items from location state
  const [orderItems, setOrderItems] = useState<OrderItem[]>(location.state?.orderItems || []);
  const fromBuyNow = location.state?.fromBuyNow || false;

  const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Redirect if no items
  useEffect(() => {
    if (orderItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [orderItems.length, navigate, toast]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 6-digit ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData({
      ...formData,
      paymentMethod: value
    });
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (itemId: number) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check all required fields and correct any errors.",
        variant: "destructive"
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create order data
      const orderData = {
        storeId: 'demo-store-id',
        buyerName: formData.fullName,
        buyerEmail: formData.email,
        buyerPhone: formData.phone,
        buyerAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        totalPrice: total,
        paymentMethod: formData.paymentMethod,
        status: 'placed',
        items: orderItems.map(item => ({
          productId: `product-${item.id}`,
          quantity: item.quantity,
          priceAtPurchase: item.price,
          name: item.name
        }))
      };

      // Send order confirmation email
      const emailData = {
        buyerName: formData.fullName,
        storeName: 'Demo Store', // This should come from store context
        items: orderItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: total
      };

      await emailService.sendOrderPlacedEmail(
        orderId,
        formData.email,
        emailData,
        'seller@demostore.com' // This should come from store data
      );

      // Navigate to success page
      navigate('/order-success', {
        state: {
          orderId,
          orderItems,
          total,
          customerInfo: formData,
          paymentInfo: {
            paymentMethod: formData.paymentMethod,
            paymentStatus: formData.paymentMethod === 'cod' ? 'Pending' : 'Paid',
            paymentTime: new Date().toLocaleString()
          },
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      });

      toast({
        title: "Order Placed Successfully!",
        description: "We've sent a confirmation email with your order details.",
      });

    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: "Order Failed",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <ResponsiveLayout maxWidth="7xl" padding="md">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your order securely</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input 
                        id="fullName" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange}
                        className={errors.fullName ? 'border-red-500' : ''}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required 
                      />
                      {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        className={errors.email ? 'border-red-500' : ''}
                        placeholder="your@email.com"
                        autoComplete="email"
                        required 
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel"
                      value={formData.phone} 
                      onChange={handleInputChange}
                      className={errors.phone ? 'border-red-500' : ''}
                      placeholder="10-digit phone number"
                      autoComplete="tel"
                      inputMode="numeric"
                      required 
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange}
                      className={errors.address ? 'border-red-500' : ''}
                      placeholder="House number, street, area"
                      autoComplete="street-address"
                      rows={2}
                      required 
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        className={errors.city ? 'border-red-500' : ''}
                        placeholder="City"
                        autoComplete="address-level2"
                        required 
                      />
                      {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleInputChange}
                        className={errors.state ? 'border-red-500' : ''}
                        placeholder="State"
                        autoComplete="address-level1"
                        required 
                      />
                      {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">PIN Code *</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        onChange={handleInputChange}
                        className={errors.zipCode ? 'border-red-500' : ''}
                        placeholder="6-digit PIN"
                        autoComplete="postal-code"
                        inputMode="numeric"
                        maxLength={6}
                        required 
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                        </div>
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg opacity-50">
                    <RadioGroupItem value="online" id="online" disabled />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Online Payment</div>
                          <div className="text-sm text-muted-foreground">Coming soon - UPI, Cards, Wallets</div>
                        </div>
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({orderItems.length} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Place Order - ₹{total.toLocaleString()}
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-center text-xs text-muted-foreground pt-2">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Secure checkout • Free shipping • Easy returns
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Checkout;
