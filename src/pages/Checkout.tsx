import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice, safeParsePrice, isValidProduct } from '@/utils/priceUtils';
import { supabase } from '@/integrations/supabase/client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

const Checkout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  
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

  // Debug: Log cart items to verify data
  console.log('Checkout: Current cart items:', cartItems);
  console.log('Checkout: Cart items count:', cartItems.length);

  React.useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      navigate('/cart');
      return;
    }

    // Check for invalid products
    const invalidProducts = cartItems.filter(item => !isValidProduct(item.product));
    if (invalidProducts.length > 0) {
      toast({
        title: "Some products are unavailable",
        description: "This product is not available anymore. Please contact the seller.",
        variant: "destructive"
      });
      setTimeout(() => {
        navigate('/store/demo');
      }, 3000);
    }
  }, [cartItems, navigate, toast]);

  const total = getTotalPrice();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fill all required fields",
        description: "Check all required fields and correct any errors.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }

    const invalidProducts = cartItems.filter(item => !isValidProduct(item.product));
    if (invalidProducts.length > 0) {
      toast({
        title: "Invalid products in cart",
        description: "Some products in your cart are invalid. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log('Starting order creation with cart items:', cartItems);
    
    try {
      // Get the store_id from the first cart item's product
      const storeId = cartItems[0]?.product?.store_id;
      
      if (!storeId) {
        throw new Error('Store ID not found in cart items');
      }

      // Create order directly in Supabase with correct store_id
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: storeId,
          buyer_name: formData.fullName,
          buyer_email: formData.email,
          buyer_phone: formData.phone,
          buyer_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          total_price: total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', orderData.id);

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: safeParsePrice(item.product.price)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', orderData.id);
        throw new Error('Failed to create order items');
      }

      console.log('Order items created successfully');
      
      await clearCart();
      
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'cod'
      });

      toast({
        title: "✅ Order placed successfully!",
        description: "You will receive a confirmation email soon.",
      });
      
      navigate('/order-success', {
        state: {
          orderId: orderData.id,
          orderItems: cartItems.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: safeParsePrice(item.product.price),
            quantity: item.quantity,
            image: item.product.image_url || '/placeholder.svg'
          })),
          total,
          customerInfo: formData,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()
        }
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      
      toast({
        title: "⚠️ Sorry, order could not be placed.",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild>
            <Link to="/store/demo">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/cart">Cart</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">Confirmation</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back to Cart Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Cart
        </Link>
      </Button>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Customer Information Form */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange}
                    className={errors.fullName ? 'border-red-500' : ''}
                    required 
                  />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    className={errors.email ? 'border-red-500' : ''}
                    required 
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-red-500' : ''}
                  placeholder="10-digit phone number"
                  required 
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="address">Shipping Address *</Label>
                <Textarea 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange}
                  className={errors.address ? 'border-red-500' : ''}
                  placeholder="Street address, apartment, suite, etc."
                  required 
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange}
                    className={errors.city ? 'border-red-500' : ''}
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
                    required 
                  />
                  {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input 
                    id="zipCode" 
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleInputChange}
                    className={errors.zipCode ? 'border-red-500' : ''}
                    placeholder="6-digit ZIP code"
                    required 
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <Label>Payment Method *</Label>
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI / PhonePe / GPay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet">Digital Wallet</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="lg:hidden mb-8">
                <OrderSummary cartItems={cartItems} total={total} />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || cartItems.length === 0}
              >
                {isSubmitting ? 'Processing Order...' : `Place Order - ₹${formatPrice(total)}`}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Order Summary - Hidden on mobile, shown in form */}
        <div className="hidden lg:block lg:w-1/3">
          <OrderSummary cartItems={cartItems} total={total} />
        </div>
      </div>
    </div>
  );
};

// Order Summary Component
interface OrderSummaryProps {
  cartItems: any[];
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, total }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-4">
        {cartItems.map((item) => {
          const isProductValid = isValidProduct(item.product);
          const price = safeParsePrice(item.product?.price);
          const itemTotal = price * item.quantity;
          
          return (
            <div key={item.id} className={`flex items-start gap-3 p-3 border rounded-lg ${!isProductValid ? 'border-red-200 bg-red-50' : ''}`}>
              <img 
                src={item.product?.image_url || '/placeholder.svg'} 
                alt={item.product?.name || 'Product'} 
                className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-sm ${!isProductValid ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.product?.name || 'Unknown Product'}
                </h3>
                {!isProductValid ? (
                  <p className="text-sm text-red-500">Not available</p>
                ) : (
                  <p className="text-sm text-gray-600">₹{formatPrice(price)}</p>
                )}
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className={`font-medium text-sm ${!isProductValid ? 'text-red-600' : 'text-gray-900'}`}>
                {isProductValid ? `₹${formatPrice(itemTotal)}` : 'N/A'}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>₹{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-green-600">FREE</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>₹{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
