import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { safeParsePrice, isValidProduct } from '@/utils/priceUtils';
import { useParams, useLocation } from 'react-router-dom';

interface CartItem {
  id: string;
  product: Tables<'products'>;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Tables<'products'>, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
  isLoading: boolean;
  currentStore?: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();

  // Enhanced store context detection
  const currentStoreContext = React.useMemo(() => {
    // First priority: URL parameter
    if (storeName) {
      return storeName.toLowerCase();
    }
    
    // Second priority: Check if we're on a cart page and try to get store from localStorage
    if (location.pathname === '/cart') {
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
        console.log('Could not parse store context from localStorage');
      }
    }
    
    return null;
  }, [storeName, location.pathname]);

  // Track current store context with enhanced logic
  useEffect(() => {
    if (currentStoreContext) {
      // Normalize store name for consistent tracking
      const normalizedStoreName = currentStoreContext.toLowerCase();
      localStorage.setItem('currentStore', normalizedStoreName);
      localStorage.setItem('lastVisitedStore', normalizedStoreName);
      
      // Store additional context for checkout flow
      const storeContext = {
        storeName: normalizedStoreName,
        originalPath: location.pathname,
        timestamp: Date.now()
      };
      localStorage.setItem('shopzap_store_context', JSON.stringify(storeContext));
    }
  }, [currentStoreContext, location.pathname]);

  // Generate or get session ID with enhanced store context
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);
    }
    
    // Create enhanced backup cart data with store context
    if (currentStoreContext) {
      const cartBackup = {
        sessionId,
        storeName: currentStoreContext.toLowerCase(),
        timestamp: Date.now(),
        itemCount: items.length,
        totalPrice: getTotalPrice()
      };
      localStorage.setItem('shopzap_cart_backup', JSON.stringify(cartBackup));
    }
    
    return sessionId;
  };

  // Load cart items from database with store context validation
  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      const sessionId = getSessionId();
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products (*)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;

      const cartItems: CartItem[] = (data || [])
        .filter(item => item.products && isValidProduct(item.products))
        .map(item => ({
          id: item.id,
          product: item.products as Tables<'products'>,
          quantity: item.quantity
        }));

      setItems(cartItems);
      
      // Update backup after successful load
      if (currentStoreContext && cartItems.length > 0) {
        const cartBackup = {
          sessionId,
          storeName: currentStoreContext.toLowerCase(),
          timestamp: Date.now(),
          itemCount: cartItems.length,
          totalPrice: cartItems.reduce((total, item) => {
            const price = safeParsePrice(item.product?.price);
            return total + (price * item.quantity);
          }, 0)
        };
        localStorage.setItem('shopzap_cart_backup', JSON.stringify(cartBackup));
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCartItems();
  }, [currentStoreContext]); // Reload cart when store context changes

  const addToCart = async (product: Tables<'products'>, quantity = 1) => {
    try {
      if (!isValidProduct(product)) {
        toast({
          title: "Product unavailable",
          description: "This product is not available right now.",
          variant: "destructive",
        });
        return;
      }

      const sessionId = getSessionId();
      
      // Check if item already exists in cart
      const existingItem = items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        await updateQuantity(product.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            session_id: sessionId,
            product_id: product.id,
            store_id: product.store_id,
            quantity
          });

        if (error) throw error;
        
        await loadCartItems();
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('session_id', sessionId)
        .eq('product_id', productId);

      if (error) throw error;
      
      await loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId)
        .eq('product_id', productId);

      if (error) throw error;
      
      await loadCartItems();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      
      setItems([]);
      localStorage.removeItem('cart_session_id');
      localStorage.removeItem('shopzap_cart_backup');
      // Don't remove store context on cart clear, as user might still be browsing
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      if (!isValidProduct(item.product)) {
        return total;
      }
      const price = safeParsePrice(item.product?.price);
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemCount,
    isLoading,
    currentStore: currentStoreContext?.toLowerCase()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
