
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { safeParsePrice, isValidProduct } from '@/utils/priceUtils';
import { useParams } from 'react-router-dom';

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

  // Track current store context
  useEffect(() => {
    if (storeName) {
      localStorage.setItem('currentStore', storeName);
      localStorage.setItem('lastVisitedStore', storeName);
    }
  }, [storeName]);

  // Generate or get session ID with store context
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);
    }
    
    // Create backup cart data with store context
    if (storeName) {
      const cartBackup = {
        sessionId,
        storeName,
        timestamp: Date.now()
      };
      localStorage.setItem('shopzap_cart_backup', JSON.stringify(cartBackup));
    }
    
    return sessionId;
  };

  // Load cart items from database
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
  }, [storeName]); // Reload cart when store changes

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
    currentStore: storeName
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
