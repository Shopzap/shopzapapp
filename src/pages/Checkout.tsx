
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  store_id: string;
}

interface ProductVariant {
  id: string;
  price: number;
  inventory_count: number;
  options: { [key: string]: string };
}

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    buyer_address: '',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Product ID not found",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      try {
        console.log('Fetching product with ID:', id);
        
        // Check if product and variant data was passed via state
        const stateData = location.state as any;
        if (stateData?.product) {
          setProduct(stateData.product);
          setVariant(stateData.variant || null);
          setQuantity(stateData.quantity || 1);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .single();

        if (error) {
          console.error('Product fetch error:', error);
          toast({
            title: "Error loading product",
            description: error.message,
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        if (!data) {
          console.log('Product not found');
          toast({
            title: "Product not found",
            description: "The product you're looking for doesn't exist or is no longer available.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        console.log('Product found:', data);
        setProduct(data);
      } catch (error: any) {
        console.error('Exception fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast, location.state]);

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
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create Razorpay order
      const { data: razorpayOrder, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: orderData.total_price * 100, // Convert to paise
          currency: 'INR',
          order_id: orderData.id
        }
      });

      if (error) throw error;

      const options = {
        key: 'rzp_test_YOUR_KEY_ID', // Replace with your Razorpay key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'ShopZap',
        description: `Payment for ${product?.name}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.id
              }
            });

            if (verifyError) throw verifyError;

            toast({
              title: "Payment successful!",
              description: "Your order has been placed successfully.",
            });

            navigate('/order-success');
          } catch (error: any) {
            toast({
              title: "Payment verification failed",
              description: error.message,
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: orderForm.buyer_name,
          email: orderForm.buyer_email,
          contact: orderForm.buyer_phone
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    try {
      const currentPrice = variant ? variant.price : product.price;
      const totalPrice = currentPrice * quantity;
      
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          store_id: product.store_id,
          buyer_name: orderForm.buyer_name,
          buyer_email: orderForm.buyer_email,
          buyer_phone: orderForm.buyer_phone,
          buyer_address: orderForm.buyer_address,
          total_price: totalPrice,
          status: 'pending',
          payment_method: 'online',
        })
        .select()
        .single();

      if (error) throw error;

      // Create order item
      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          product_variant_id: variant?.id || null,
          quantity: quantity,
          price_at_purchase: currentPrice,
        });

      // Process Razorpay payment
      await handleRazorpayPayment(order);

    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const currentPrice = variant ? variant.price : product.price;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  )}
                  {variant && (
                    <p className="text-sm text-gray-600 mt-1">
                      Variant: {Object.entries(variant.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </p>
                  )}
                  <p className="text-lg font-bold mt-2">₹{currentPrice}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span>Quantity:</span>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="buyer_name">Full Name</Label>
                  <Input
                    id="buyer_name"
                    value={orderForm.buyer_name}
                    onChange={(e) => setOrderForm({ ...orderForm, buyer_name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="buyer_email">Email</Label>
                  <Input
                    id="buyer_email"
                    type="email"
                    value={orderForm.buyer_email}
                    onChange={(e) => setOrderForm({ ...orderForm, buyer_email: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="buyer_phone">Phone Number</Label>
                  <Input
                    id="buyer_phone"
                    type="tel"
                    value={orderForm.buyer_phone}
                    onChange={(e) => setOrderForm({ ...orderForm, buyer_phone: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="buyer_address">Delivery Address</Label>
                  <Input
                    id="buyer_address"
                    value={orderForm.buyer_address}
                    onChange={(e) => setOrderForm({ ...orderForm, buyer_address: e.target.value })}
                    placeholder="Complete address with pincode"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${totalPrice} with Razorpay`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
