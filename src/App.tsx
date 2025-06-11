
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import pages directly (no lazy loading for critical pages)
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Help from '@/pages/Help';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import CookiePolicy from '@/pages/CookiePolicy';

// Dashboard components
import Dashboard from '@/pages/Dashboard';
import ProductManager from '@/pages/ProductManager';
import Orders from '@/pages/Orders';
import CustomizeStore from '@/pages/CustomizeStore';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import InstagramAutomation from '@/pages/InstagramAutomation';

// Auth components
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';

console.log('App.tsx: Starting to load');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  console.log('App.tsx: Rendering App component');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <StoreProvider>
              <Routes>
                {/* Landing page */}
                <Route path="/" element={<Index />} />
                
                {/* Static pages */}
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                
                {/* Auth routes */}
                <Route path="/auth" element={<Auth />} />

                {/* Dashboard routes wrapped with DashboardLayout and ProtectedRoute */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/products" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProductManager />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/orders" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Orders />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/customize-store" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CustomizeStore />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/instagram" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <InstagramAutomation />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/analytics" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Analytics />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                      <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
                      <a href="/" className="text-primary hover:underline">Go back to homepage</a>
                    </div>
                  </div>
                } />
              </Routes>
            </StoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

console.log('App.tsx: App component defined');

export default App;
