
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  store_id: string;
  status: string;
  is_published?: boolean;
  inventory_count?: number;
  payment_method?: string;
  product_type?: 'simple' | 'variant';
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    id: string;
    options: any;
    name: string;
  };
}

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    buyer_address: '',
    quantity: 1,
  });

  useEffect(() => {
    // Check if we have order items from navigation state (Buy Now)
    if (location.state?.orderItems) {
      setOrderItems(location.state.orderItems);
      setIsLoading(false);
      return;
    }

    // Fallback: fetch product by ID
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
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .eq('is_published', true)
          .maybeSingle();

        if (error || !data) {
          toast({
            title: "Product not found",
            description: "The product you're looking for doesn't exist or is no longer available.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        // Ensure product_type is properly typed
        const productData: Product = {
          ...data,
          product_type: (data.product_type === 'variant' ? 'variant' : 'simple') as 'simple' | 'variant'
        };

        setProduct(productData);
        // Create order item from product
        setOrderItems([{
          id: productData.id,
          name: productData.name,
          price: productData.price,
          quantity: 1,
          image: productData.image_url || 'https://placehold.co/80x80'
        }]);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const firstItem = orderItems[0];
      const storeId = product?.store_id || '';
      const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          store_id: storeId,
          buyer_name: orderForm.buyer_name,
          buyer_email: orderForm.buyer_email,
          buyer_phone: orderForm.buyer_phone,
          buyer_address: orderForm.buyer_address,
          total_price: totalPrice,
          status: 'pending',
          payment_method: 'cod',
        })
        .select()
        .single();

      if (error) throw error;

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        product_variant_id: item.variant?.id || null
      }));

      await supabase
        .from('order_items')
        .insert(orderItemsData);

      // Update inventory using proper queries instead of SQL
      for (const item of orderItems) {
        if (item.variant?.id) {
          // Update variant inventory
          const { data: currentVariant } = await supabase
            .from('product_variants')
            .select('inventory_count')
            .eq('id', item.variant.id)
            .single();

          if (currentVariant) {
            await supabase
              .from('product_variants')
              .update({ 
                inventory_count: Math.max(0, currentVariant.inventory_count - item.quantity)
              })
              .eq('id', item.variant.id);
          }
        } else {
          // Update product inventory
          const { data: currentProduct } = await supabase
            .from('products')
            .select('inventory_count')
            .eq('id', item.id)
            .single();

          if (currentProduct) {
            await supabase
              .from('products')
              .update({ 
                inventory_count: Math.max(0, (currentProduct.inventory_count || 0) - item.quantity)
              })
              .eq('id', item.id);
          }
        }
      }

      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation shortly.",
      });

      navigate('/order-success');
    } catch (error: any) {
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

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Items to Checkout</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          Variant: {item.variant.name}
                        </p>
                      )}
                      <p className="text-lg font-bold mt-2">₹{item.price}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
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
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - ₹${totalPrice} (Cash on Delivery)`
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
