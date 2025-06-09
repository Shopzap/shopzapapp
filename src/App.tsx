import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { CartProvider } from "@/hooks/useCart";
import React, { Suspense, lazy } from 'react';

// Eager load critical pages
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import OrderSuccess from "./pages/OrderSuccess";
import ThankYou from "./pages/ThankYou";
import PaymentFailed from "./pages/PaymentFailed";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";

// Lazy load non-critical pages
const StoreThemes = lazy(() => import("./pages/StoreThemes"));
const EmbedButton = lazy(() => import("./pages/EmbedButton"));
const Help = lazy(() => import("./pages/Help"));
const Blog = lazy(() => import("./pages/Blog"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const PricingPolicy = lazy(() => import("./pages/PricingPolicy"));

// Lazy load dashboard pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductManager = lazy(() => import("./pages/ProductManager"));
const Orders = lazy(() => import("./pages/Orders"));
const Settings = lazy(() => import("./pages/Settings"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const StoreBuilder = lazy(() => import("./pages/StoreBuilder"));
const CustomizeStore = lazy(() => import("./pages/CustomizeStore"));
const Analytics = lazy(() => import("./pages/Analytics"));

// Lazy load storefront pages (critical but can be optimized)
const Storefront = lazy(() => import("./pages/Storefront"));
const StorefrontAbout = lazy(() => import("./pages/StorefrontAbout"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import LegacyCartRedirect from "./components/cart/LegacyCartRedirect";
import LazyComponentWrapper from "./components/LazyComponentWrapper";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Optimized loading fallback for storefront
const StorefrontFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
    <p className="text-muted-foreground">Loading store...</p>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <StoreProvider>
              <ErrorBoundary>
                <Routes>
                  {/* Public routes - Legal pages first to avoid conflicts */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* New public pages - lazy loaded */}
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  <Route path="/store-themes" element={
                    <LazyComponentWrapper>
                      <StoreThemes />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/embed-button" element={
                    <LazyComponentWrapper>
                      <EmbedButton />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/help" element={
                    <LazyComponentWrapper>
                      <Help />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/blog" element={
                    <LazyComponentWrapper>
                      <Blog />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/tutorials" element={
                    <LazyComponentWrapper>
                      <Tutorials />
                    </LazyComponentWrapper>
                  } />
                  
                  {/* Legal pages - lazy loaded */}
                  <Route path="/terms" element={
                    <LazyComponentWrapper>
                      <Terms />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/privacy" element={
                    <LazyComponentWrapper>
                      <Privacy />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/refund" element={
                    <LazyComponentWrapper>
                      <RefundPolicy />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/shipping" element={
                    <LazyComponentWrapper>
                      <ShippingPolicy />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/pricing-policy" element={
                    <LazyComponentWrapper>
                      <PricingPolicy />
                    </LazyComponentWrapper>
                  } />
                  
                  {/* Legacy cart route - redirect to store-specific cart */}
                  <Route path="/cart" element={<LegacyCartRedirect />} />
                  
                  {/* Protected routes - lazy loaded */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <LazyComponentWrapper>
                        <Onboarding />
                      </LazyComponentWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/store-builder" element={
                    <ProtectedRoute>
                      <LazyComponentWrapper>
                        <StoreBuilder />
                      </LazyComponentWrapper>
                    </ProtectedRoute>
                  } />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} />
                  
                  {/* Order tracking routes - make these accessible without authentication */}
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="/track-order/:orderId" element={<OrderTracking />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                  
                  {/* Store routes with proper CartProvider scoping */}
                  <Route path="/store/:storeName" element={
                    <CartProvider>
                      <Suspense fallback={<StorefrontFallback />}>
                        <Storefront />
                      </Suspense>
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/about" element={
                    <CartProvider>
                      <Suspense fallback={<StorefrontFallback />}>
                        <StorefrontAbout />
                      </Suspense>
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/cart" element={
                    <CartProvider>
                      <Suspense fallback={<StorefrontFallback />}>
                        <Cart />
                      </Suspense>
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/checkout" element={
                    <CartProvider>
                      <Suspense fallback={<StorefrontFallback />}>
                        <Checkout />
                      </Suspense>
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/product/:productSlug" element={
                    <CartProvider>
                      <Suspense fallback={<StorefrontFallback />}>
                        <ProductDetails />
                      </Suspense>
                    </CartProvider>
                  } />
                  
                  {/* Dashboard routes with sidebar layout - lazy loaded */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <LazyComponentWrapper>
                          <Dashboard />
                        </LazyComponentWrapper>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/products" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <LazyComponentWrapper>
                          <ProductManager />
                        </LazyComponentWrapper>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/orders" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <LazyComponentWrapper>
                          <Orders />
                        </LazyComponentWrapper>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/customize-store" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <LazyComponentWrapper>
                          <CustomizeStore />
                        </LazyComponentWrapper>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/analytics" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <LazyComponentWrapper>
                          <Analytics />
                        </LazyComponentWrapper>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/settings" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <LazyComponentWrapper>
                          <Settings />
                        </LazyComponentWrapper>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback - redirect invalid routes to 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </StoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
