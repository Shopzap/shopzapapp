
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Home, Store } from 'lucide-react';

const LegacyCartRedirect = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCartRedirect = () => {
      // Check for current store in localStorage
      const currentStore = localStorage.getItem('currentStore');
      const lastVisitedStore = localStorage.getItem('lastVisitedStore');
      
      // Check for store context from cart session
      const cartSessionId = localStorage.getItem('cart_session_id');
      let storeFromCart = null;
      
      if (cartSessionId) {
        // Try to get store from cart items in localStorage backup
        const cartBackup = localStorage.getItem(`shopzap_cart_backup`);
        if (cartBackup) {
          try {
            const cartData = JSON.parse(cartBackup);
            storeFromCart = cartData.storeName;
          } catch (error) {
            console.error('Error parsing cart backup:', error);
          }
        }
      }

      // Priority: currentStore > storeFromCart > lastVisitedStore
      const targetStore = currentStore || storeFromCart || lastVisitedStore;

      if (targetStore) {
        console.log('Redirecting to store cart:', targetStore);
        navigate(`/store/${targetStore}/cart`, { replace: true });
      } else {
        setIsLoading(false);
      }
    };

    // Small delay to allow for any store context to be set
    const timer = setTimeout(handleCartRedirect, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleBrowseStores = () => {
    // For now, redirect to home - could be enhanced to show store directory
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="text-2xl">Cart Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Oops! We couldn't find your active store. Please go to your store first to access your cart.
          </p>
          
          <div className="space-y-3">
            <Button onClick={handleBrowseStores} className="w-full">
              <Store className="w-4 h-4 mr-2" />
              Browse Stores
            </Button>
            
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to ShopZap Home
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Tip:</p>
            <p>Visit any store page first, then your cart will be available at that store's cart page.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegacyCartRedirect;
