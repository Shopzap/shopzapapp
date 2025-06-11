
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Home } from 'lucide-react';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreNotFound from '@/components/storefront/StoreNotFound';
import StorefrontLoader from '@/components/storefront/StorefrontLoader';

const Cart = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  // Check if we have a store context from localStorage as fallback
  const fallbackStoreName = React.useMemo(() => {
    if (storeName) return storeName;
    
    // Try to get store context from localStorage
    try {
      const storeContext = localStorage.getItem('shopzap_store_context');
      if (storeContext) {
        const parsed = JSON.parse(storeContext);
        return parsed.storeName;
      }
      
      const lastVisitedStore = localStorage.getItem('lastVisitedStore');
      if (lastVisitedStore) {
        return lastVisitedStore;
      }
    } catch (error) {
      console.log('Could not get store context from localStorage');
    }
    
    return null;
  }, [storeName]);

  // Normalize the store name to lowercase for consistent querying
  const normalizedStoreName = fallbackStoreName?.toLowerCase();

  // Fetch store data only if we have a store name
  const { data: storeData, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['store-lookup-cart', normalizedStoreName],
    queryFn: async () => {
      if (!normalizedStoreName) {
        return null; // Return null instead of throwing error
      }
      
      try {
        // First, try to find by slug (new preferred method)
        let { data: slugData, error: slugError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', normalizedStoreName)
          .single();
          
        if (slugData && !slugError) {
          return { store: slugData, redirectNeeded: false };
        }
        
        // If not found by slug, try username (legacy support)
        let { data: usernameData, error: usernameError } = await supabase
          .from('stores')
          .select('*')
          .eq('username', normalizedStoreName)
          .single();
          
        if (usernameData && !usernameError) {
          return { store: usernameData, redirectNeeded: true };
        }
        
        // Finally, try name field as fallback
        let { data: nameData, error: nameError } = await supabase
          .from('stores')
          .select('*')
          .eq('name', normalizedStoreName)
          .single();
          
        if (nameData && !nameError) {
          return { store: nameData, redirectNeeded: false };
        }
        
        return null; // Store not found, but don't throw error
      } catch (err) {
        console.error('Cart: Exception in store fetch', err);
        return null;
      }
    },
    enabled: !!normalizedStoreName,
  });

  // Extract store from the data structure
  const store = storeData?.store;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = () => {
    if (store?.slug) {
      navigate(`/store/${store.slug}/checkout`);
    } else if (storeName) {
      navigate(`/store/${storeName}/checkout`);
    } else {
      // Fallback to global checkout
      navigate('/checkout');
    }
  };

  const handleContinueShopping = () => {
    // Use slug if available, otherwise fall back to storeName
    if (store?.slug) {
      navigate(`/store/${store.slug}`);
    } else if (storeName || fallbackStoreName) {
      navigate(`/store/${storeName || fallbackStoreName}`);
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Show loading state while store is being fetched (only if we have a store name)
  if (normalizedStoreName && storeLoading) {
    return <StorefrontLoader storeName={normalizedStoreName} message="Loading cart..." />;
  }

  // If we have a store name but store wasn't found, show store not found
  if (normalizedStoreName && !store && !storeLoading) {
    return <StoreNotFound storeName={normalizedStoreName} />;
  }

  // If no store context at all, show a generic cart page
  if (!normalizedStoreName && !store) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <Button variant="ghost" onClick={handleGoHome} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {items.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                  <p className="text-gray-600 mb-6">Start shopping to add items to your cart!</p>
                  <Button onClick={handleGoHome}>
                    Go to Homepage
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product.image_url || 'https://placehold.co/80x80'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.product.name}</h3>
                            <p className="text-gray-600">{formatPrice(Number(item.product.price))}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>{formatPrice(getTotalPrice())}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                      >
                        Proceed to Checkout
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={clearCart}
                        disabled={items.length === 0}
                      >
                        Clear Cart
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render with store context
  const storeWithTheme = {
    ...store,
    primary_color: store.theme && typeof store.theme === 'object' ? (store.theme as any).primary_color || '#6c5ce7' : '#6c5ce7',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader store={storeWithTheme} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={handleContinueShopping}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>

          {items.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some products to get started!</p>
                <Button onClick={handleContinueShopping}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.product.image_url || 'https://placehold.co/80x80'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.product.name}</h3>
                          <p className="text-gray-600">{formatPrice(Number(item.product.price))}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCheckout}
                      disabled={items.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={clearCart}
                      disabled={items.length === 0}
                    >
                      Clear Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
