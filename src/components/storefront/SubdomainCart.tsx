
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

interface SubdomainCartProps {
  store: Tables<'stores'>;
}

const SubdomainCart: React.FC<SubdomainCartProps> = ({ store }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getItemCount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const total = getTotalPrice();
  const itemCount = getItemCount();

  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Button asChild size="lg">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="space-y-4">
                {items.map((item) => {
                  const price = Number(item.product?.price) || 0;
                  const itemTotal = price * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
                      <img
                        src={item.product?.image_url || '/placeholder.svg'}
                        alt={item.product?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.product?.description || ''}</p>
                        <p className="text-lg font-bold mt-1 text-gray-900">
                          ₹{price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item.product.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item.product.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          ₹{itemTotal.toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({itemCount})</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link to="/">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainCart;
