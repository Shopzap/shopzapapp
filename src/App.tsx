
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { isSubdomainRoute } from '@/utils/subdomainUtils';

// Main app pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import ProductManager from '@/pages/ProductManager';
import Onboarding from '@/pages/Onboarding';
import CustomizeStore from '@/pages/CustomizeStore';
import Settings from '@/pages/Settings';
import Orders from '@/pages/Orders';
import DashboardOrders from '@/pages/DashboardOrders';
import Analytics from '@/pages/Analytics';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import OrderTracking from '@/pages/OrderTracking';
import OrderSuccess from '@/pages/OrderSuccess';
import OrderRedirect from '@/pages/OrderRedirect';
import StorefrontAbout from '@/pages/StorefrontAbout';
import AuthCallback from '@/pages/AuthCallback';
import Verify from '@/pages/Verify';
import EmbedGenerator from '@/pages/EmbedGenerator';
import StoreBuilder from '@/pages/StoreBuilder';

// Legacy storefront (for /store/ URLs)
import Storefront from '@/pages/Storefront';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';

// New subdomain storefront
import SubdomainStorefront from '@/components/storefront/SubdomainStorefront';

import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  // Check if this is a subdomain route
  const isSubdomain = isSubdomainRoute();
  
  console.log('App: Current hostname =', window.location.hostname);
  console.log('App: Is subdomain route =', isSubdomain);
  console.log('App: Current pathname =', window.location.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <StoreProvider>
              <div className="App">
                {isSubdomain ? (
                  // Subdomain routing (e.g., store.shopzap.io)
                  <SubdomainStorefront />
                ) : (
                  // Main app routing (e.g., shopzap.io)
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    
                    {/* Legacy storefront routes */}
                    <Route path="/store/:storeName" element={<Storefront />} />
                    <Route path="/store/:storeName/about" element={<StorefrontAbout />} />
                    <Route path="/product/:productId" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/order-redirect" element={<OrderRedirect />} />
                    <Route path="/order-tracking" element={<OrderTracking />} />
                    
                    {/* Protected dashboard routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/products" 
                      element={
                        <ProtectedRoute>
                          <ProductManager />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/onboarding" 
                      element={
                        <ProtectedRoute>
                          <Onboarding />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/customize" 
                      element={
                        <ProtectedRoute>
                          <CustomizeStore />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard/orders" 
                      element={
                        <ProtectedRoute>
                          <DashboardOrders />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/embed" 
                      element={
                        <ProtectedRoute>
                          <EmbedGenerator />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/builder" 
                      element={
                        <ProtectedRoute>
                          <StoreBuilder />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                )}
                <Toaster />
              </div>
            </StoreProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
