
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
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
import ProductManager from '@/pages/ProductManager';
import Orders from '@/pages/Orders';
import Analytics from '@/pages/Analytics';
import Invoices from '@/pages/Invoices';
import Payouts from '@/pages/Payouts';
import BankDetails from '@/pages/BankDetails';
import CustomizeStore from '@/pages/CustomizeStore';
import Settings from '@/pages/Settings';

// Layout
import DashboardLayout from '@/components/layouts/DashboardLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/signup" element={<Auth />} />
                  
                  {/* Dashboard routes with persistent layout */}
                  <Route path="/dashboard/*" element={
                    <DashboardLayout>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<ProductManager />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="invoices" element={<Invoices />} />
                        <Route path="payouts" element={<Payouts />} />
                        <Route path="bank-details" element={<BankDetails />} />
                        <Route path="customize-store" element={<CustomizeStore />} />
                        <Route path="settings" element={<Settings />} />
                      </Routes>
                    </DashboardLayout>
                  } />
                  
                  {/* Product details route - now using relative path */}
                  <Route path="/product/:productId" element={<ProductDetails />} />
                  
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
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
