
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

interface SubdomainCheckoutProps {
  store: Tables<'stores'>;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const SubdomainCheckout: React.FC<SubdomainCheckoutProps> = ({ store }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = getTotalPrice();

  React.useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      navigate('/cart');
    }
  }, [cartItems, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: store.id,
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

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: Number(item.product.price) || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        await supabase.from('orders').delete().eq('id', orderData.id);
        throw new Error('Failed to create order items');
      }
      
      await clearCart();
      
      toast({
        title: "✅ Order placed successfully!",
        description: "You will receive a confirmation email soon.",
      });
      
      // Navigate to a success page or back to store
      navigate('/', {
        state: {
          orderSuccess: true,
          orderId: orderData.id
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild>
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/cart')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
              <div className="flex items-center space-x-3">
                {store.logo_image && (
                  <img 
                    src={store.logo_image} 
                    alt={store.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
                <span className="font-semibold text-gray-900">{store.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      placeholder="10-digit phone number"
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange}
                    placeholder="Street address, apartment, suite, etc."
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input 
                      id="state" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input 
                      id="zipCode" 
                      name="zipCode" 
                      value={formData.zipCode} 
                      onChange={handleInputChange}
                      placeholder="6-digit ZIP code"
                      required 
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Processing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-4">
                {cartItems.map((item) => {
                  const price = Number(item.product?.price) || 0;
                  const itemTotal = price * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <img 
                        src={item.product?.image_url || '/placeholder.svg'} 
                        alt={item.product?.name || 'Product'} 
                        className="w-12 h-12 object-cover rounded" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {item.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm text-gray-900">
                        ₹{itemTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubdomainCheckout;
