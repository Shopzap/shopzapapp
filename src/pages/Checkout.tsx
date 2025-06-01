
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Checkout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get order items from location state or use mock data
  const [orderItems, setOrderItems] = useState(location.state?.orderItems || [
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

  const validateForm = () => {
    const newErrors = {};
    
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handlePaymentMethodChange = (value) => {
    setFormData({
      ...formData,
      paymentMethod: value
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0
      setOrderItems(orderItems.filter(item => item.id !== itemId));
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
      return;
    }
    
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    });
  };

  const handleSubmit = (e) => {
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
    
    // Simulate API call
    setTimeout(() => {
      const orderId = `ORD-${Date.now()}`;
      
      // Navigate to order success page with order details
      navigate('/order-success', {
        state: {
          orderId,
          orderItems,
          total,
          customerInfo: formData,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()
        }
      });
    }, 2000);
  };

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
                <OrderSummary 
                  orderItems={orderItems} 
                  subtotal={subtotal} 
                  shipping={shipping} 
                  total={total}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || orderItems.length === 0}
              >
                {isSubmitting ? 'Processing Order...' : `Place Order - ₹${total.toLocaleString()}`}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Order Summary - Hidden on mobile, shown in form */}
        <div className="hidden lg:block lg:w-1/3">
          <OrderSummary 
            orderItems={orderItems} 
            subtotal={subtotal} 
            shipping={shipping} 
            total={total}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
          />
        </div>
      </div>
    </div>
  );
};

// Enhanced Order Summary Component with quantity controls
const OrderSummary = ({ orderItems, subtotal, shipping, total, updateQuantity, removeItem }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-4">
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-sm text-gray-600">₹{item.price.toLocaleString()}</p>
              
              {/* Quantity Controls */}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>
      
      {orderItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Your cart is empty</p>
          <Button asChild className="mt-4">
            <Link to="/store/demo">Continue Shopping</Link>
          </Button>
        </div>
      )}
      
      {orderItems.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
