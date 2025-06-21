
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { safeParsePrice, isValidProduct } from '@/utils/priceUtils';
import { useParams, useLocation } from 'react-router-dom';
import { persistenceUtils, LocalStorageKeys } from '@/utils/persistence';

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

  // Enhanced store context detection with proper typing
  const currentStoreContext = React.useMemo(() => {
    if (storeName) {
      return storeName.toLowerCase();
    }
    
    if (location.pathname === '/cart') {
      try {
        const storeContext = persistenceUtils.getItem<{ storeName: string }>(LocalStorageKeys.STORE_CONTEXT);
        if (storeContext && typeof storeContext.storeName === 'string') {
          return storeContext.storeName;
        }
        
        const lastVisitedStore = persistenceUtils.getItem<string>(LocalStorageKeys.LAST_VISITED_STORE);
        if (lastVisitedStore && typeof lastVisitedStore === 'string') {
          return lastVisitedStore;
        }
      } catch (error) {
        console.log('Could not parse store context from localStorage');
      }
    }
    
    return null;
  }, [storeName, location.pathname]);

  // Track current store context with enhanced persistence
  useEffect(() => {
    if (currentStoreContext) {
      const normalizedStoreName = currentStoreContext.toLowerCase();
      persistenceUtils.setItem('currentStore', normalizedStoreName);
      persistenceUtils.setItem(LocalStorageKeys.LAST_VISITED_STORE, normalizedStoreName);
      
      const storeContext = {
        storeName: normalizedStoreName,
        originalPath: location.pathname,
        timestamp: Date.now()
      };
      persistenceUtils.setItem(LocalStorageKeys.STORE_CONTEXT, storeContext);
    }
  }, [currentStoreContext, location.pathname]);

  // Generate or get session ID with enhanced backup
  const getSessionId = () => {
    let sessionId = persistenceUtils.getItem<string>(LocalStorageKeys.CART_SESSION);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      persistenceUtils.setItem(LocalStorageKeys.CART_SESSION, sessionId);
    }
    return sessionId;
  };

  // Save cart backup whenever items change
  useEffect(() => {
    if (items.length > 0 && currentStoreContext) {
      const sessionId = getSessionId();
      persistenceUtils.saveCartBackup({
        sessionId,
        storeName: currentStoreContext.toLowerCase(),
        itemCount: items.length,
        totalPrice: getTotalPrice(),
        items: items.map(item => ({
          id: item.id,
          productId: item.product.id,
          quantity: item.quantity,
          productName: item.product.name,
          productPrice: item.product.price
        }))
      });
    }
  }, [items, currentStoreContext]);

  // Load cart items from database with persistence fallback
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
        persistenceUtils.saveCartBackup({
          sessionId,
          storeName: currentStoreContext.toLowerCase(),
          itemCount: cartItems.length,
          totalPrice: cartItems.reduce((total, item) => {
            const price = safeParsePrice(item.product?.price);
            return total + (price * item.quantity);
          }, 0),
          items: cartItems.map(item => ({
            id: item.id,
            productId: item.product.id,
            quantity: item.quantity,
            productName: item.product.name,
            productPrice: item.product.price
          }))
        });
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
  }, [currentStoreContext]);

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
      persistenceUtils.removeItem(LocalStorageKeys.CART_SESSION);
      persistenceUtils.clearCartBackup();
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
    currentStore: currentStoreContext?.toLowerCase() || undefined
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
