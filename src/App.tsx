
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/hooks/useCart';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import StoreCheckout from '@/pages/StoreCheckout';
import Storefront from '@/pages/Storefront';
import OrderSuccess from '@/pages/OrderSuccess';
import ThankYou from '@/pages/ThankYou';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/:id" element={<Checkout />} />
                <Route path="/store/:storeName" element={<Storefront />} />
                <Route path="/store/:storeName/cart" element={<Cart />} />
                <Route path="/store/:storeName/checkout" element={<StoreCheckout />} />
                <Route path="/store/:storeName/product/:productId" element={<ProductDetails />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/thank-you" element={<ThankYou />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
