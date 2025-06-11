
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import LazyComponentWrapper from '@/components/LazyComponentWrapper';

// Import pages directly (no lazy loading for critical pages)
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Help from '@/pages/Help';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import CookiePolicy from '@/pages/CookiePolicy';

// Auth components
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';

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

                {/* Dashboard routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                
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
