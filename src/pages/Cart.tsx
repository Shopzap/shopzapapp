import React, { useEffect } from 'react';
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
import { persistenceUtils } from '@/utils/persistence';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();

  // Check for cart backup on component mount
  useEffect(() => {
    const cartBackup = persistenceUtils.getCartBackup();
    if (cartBackup && items.length === 0) {
      // Show restoration message if backup exists but cart is empty
      toast({
        title: "Cart Restored",
        description: `Found ${cartBackup.itemCount} items from your previous session.`,
        duration: 4000,
      });
    }
  }, [items.length, toast]);

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
        // First, try to find by username (preferred method)
        let { data: usernameData, error: usernameError } = await supabase
          .from('stores')
          .select('*')
          .eq('username', normalizedStoreName)
          .maybeSingle();
          
        if (usernameData && !usernameError) {
          return { store: usernameData, redirectNeeded: false };
        }
        
        // If not found by username, try name field as fallback
        let { data: nameData, error: nameError } = await supabase
          .from('stores')
          .select('*')
          .eq('name', normalizedStoreName)
          .maybeSingle();
          
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
    if (store?.username) {
      navigate(`/store/${store.username}/checkout`);
    } else if (storeName) {
      navigate(`/store/${storeName}/checkout`);
    } else {
      // Fallback to global checkout
      navigate('/checkout');
    }
  };

  const handleContinueShopping = () => {
    // Use username if available, otherwise fall back to storeName
    if (store?.username) {
      navigate(`/store/${store.username}`);
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
          <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold">Shopping Cart</h1>
              <Button variant="ghost" onClick={handleGoHome} className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            {items.length === 0 ? (
              <Card className="text-center py-12 sm:py-16">
                <CardContent className="px-4">
                  <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Start shopping to add items to your cart!</p>
                  <Button onClick={handleGoHome} className="w-full sm:w-auto">
                    Go to Homepage
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                          <img
                            src={item.product.image_url || 'https://placehold.co/80x80'}
                            alt={item.product.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto sm:mx-0"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{item.product.name}</h3>
                            <p className="text-gray-600 text-sm sm:text-base">{formatPrice(Number(item.product.price))}</p>
                          </div>
                          <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 mx-auto sm:mx-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Subtotal</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      <div className="border-t pt-3 sm:pt-4">
                        <div className="flex justify-between font-semibold text-base sm:text-lg">
                          <span>Total</span>
                          <span>{formatPrice(getTotalPrice())}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full text-sm sm:text-base" 
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                      >
                        Proceed to Checkout
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-sm sm:text-base" 
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
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={handleContinueShopping}
              className="flex items-center gap-2 text-sm w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full sm:w-auto">
              Shopping Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </h1>
          </div>

          {items.length === 0 ? (
            <Card className="text-center py-12 sm:py-16">
              <CardContent className="px-4">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Add some products to get started!</p>
                <Button onClick={handleContinueShopping} className="w-full sm:w-auto">
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <img
                          src={item.product.image_url || 'https://placehold.co/80x80'}
                          alt={item.product.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto sm:mx-0"
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{item.product.name}</h3>
                          <p className="text-gray-600 text-sm sm:text-base">{formatPrice(Number(item.product.price))}</p>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4">
                          <div className="flex items-center gap-2 mx-auto sm:mx-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-3 sm:pt-4">
                      <div className="flex justify-between font-semibold text-base sm:text-lg">
                        <span>Total</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full text-sm sm:text-base" 
                      onClick={handleCheckout}
                      disabled={items.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-sm sm:text-base" 
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
