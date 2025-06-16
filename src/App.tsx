import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import React, { Suspense, lazy } from 'react';

// Pages
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import StoreBuilder from "./pages/StoreBuilder";
import EmbedGenerator from "./pages/EmbedGenerator";
import Dashboard from "./pages/Dashboard.tsx";
import ProductManager from './pages/ProductManager';
import Analytics from './pages/Analytics';
import Orders from "./pages/Orders";
import CustomizeStore from "./pages/CustomizeStore";
import Settings from "./pages/Settings";
import InstagramAutomation from "./pages/InstagramAutomation";
import NotFound from "./pages/NotFound";
import Verify from "./pages/Verify"; 
import AuthCallback from "./pages/AuthCallback";
import OrderTracking from "./pages/OrderTracking";
import ThankYou from "./pages/ThankYou";
import Invoices from "./pages/Invoices";

// Legal pages
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import PricingPolicy from "./pages/PricingPolicy";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Help from "./pages/Help";
import Tutorials from "./pages/Tutorials";
import StoreThemes from "./pages/StoreThemes";
import EmbedButton from "./pages/EmbedButton";

// Lazy loaded components with better fallbacks
const Storefront = lazy(() => import("./pages/Storefront"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const InvoicePage = lazy(() => import("./pages/InvoicePage"));
const CorrectionPage = lazy(() => import("./pages/CorrectionPage"));

// Core e-commerce pages - CRITICAL ROUTES - DO NOT REMOVE
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderRedirect from "./pages/OrderRedirect";

// Enhanced components
import { AuthProvider } from "./contexts/AuthContext"; 
import { StoreProvider } from './contexts/StoreContext';
import { CartProvider } from './hooks/useCart';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ResponsiveLayout from "./components/ResponsiveLayout";
import StorefrontSkeleton from "./components/skeletons/StorefrontSkeleton";
import ProductDetailsSkeleton from "./components/skeletons/ProductDetailsSkeleton";
import { useReferralTracking } from "./hooks/useReferralTracking";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Prevent excessive refetching
    },
  },
});

// Store pages wrapper with CartProvider
const StorePageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <CartProvider>
      <ResponsiveLayout>
        {children}
      </ResponsiveLayout>
    </CartProvider>
  </ErrorBoundary>
);

// Global cart page wrapper with CartProvider
const GlobalCartWrapper = () => (
  <ErrorBoundary>
    <CartProvider>
      <ResponsiveLayout>
        <Cart />
      </ResponsiveLayout>
    </CartProvider>
  </ErrorBoundary>
);

// Checkout wrapper with CartProvider
const CheckoutWrapper = () => (
  <ErrorBoundary>
    <CartProvider>
      <ResponsiveLayout>
        <Checkout />
      </ResponsiveLayout>
    </CartProvider>
  </ErrorBoundary>
);

// Enhanced loading fallback components
const StorefrontFallback = () => (
  <ResponsiveLayout>
    <StorefrontSkeleton />
  </ResponsiveLayout>
);

const ProductDetailsFallback = () => (
  <ResponsiveLayout>
    <ProductDetailsSkeleton />
  </ResponsiveLayout>
);

// Create a separate App component wrapper to ensure proper provider nesting
const AppContent = () => {
  // Track referrals on app load
  useReferralTracking();
  
  return (
    <Routes>
      {/* Public routes with responsive wrapper */}
      <Route path="/" element={<ResponsiveLayout><Index /></ResponsiveLayout>} />
      <Route path="/pricing" element={<ResponsiveLayout><Pricing /></ResponsiveLayout>} />
      <Route path="/features" element={<ResponsiveLayout><Features /></ResponsiveLayout>} />

      {/* Legal and info pages */}
      <Route path="/terms" element={<ResponsiveLayout><Terms /></ResponsiveLayout>} />
      <Route path="/privacy" element={<ResponsiveLayout><Privacy /></ResponsiveLayout>} />
      <Route path="/refund" element={<ResponsiveLayout><RefundPolicy /></ResponsiveLayout>} />
      <Route path="/shipping" element={<ResponsiveLayout><ShippingPolicy /></ResponsiveLayout>} />
      <Route path="/pricing-policy" element={<ResponsiveLayout><PricingPolicy /></ResponsiveLayout>} />
      <Route path="/contact" element={<ResponsiveLayout><Contact /></ResponsiveLayout>} />
      <Route path="/blog" element={<ResponsiveLayout><Blog /></ResponsiveLayout>} />
      <Route path="/help" element={<ResponsiveLayout><Help /></ResponsiveLayout>} />
      <Route path="/tutorials" element={<ResponsiveLayout><Tutorials /></ResponsiveLayout>} />
      <Route path="/store-themes" element={<ResponsiveLayout><StoreThemes /></ResponsiveLayout>} />
      <Route path="/embed-button" element={<ResponsiveLayout><EmbedButton /></ResponsiveLayout>} />

      {/* Auth routes */}
      <Route path="/auth" element={<ResponsiveLayout><Auth /></ResponsiveLayout>} />
      <Route path="/verify" element={<ResponsiveLayout><Verify /></ResponsiveLayout>} /> 
      <Route path="/auth-callback" element={<ResponsiveLayout><AuthCallback /></ResponsiveLayout>} />
      
      {/* 🔒 CORE E-COMMERCE ROUTES - CRITICAL - DO NOT REMOVE OR MODIFY 🔒 */}
      {/* Global cart route - handles both store-specific and general cart access */}
      <Route path="/cart" element={<GlobalCartWrapper />} />
      
      {/* Checkout route - CRITICAL FOR PAYMENTS */}
      <Route path="/checkout" element={<CheckoutWrapper />} />
      
      {/* Order completion routes */}
      <Route path="/order-success" element={<ResponsiveLayout><OrderSuccess /></ResponsiveLayout>} />
      <Route path="/thank-you" element={<ResponsiveLayout><ThankYou /></ResponsiveLayout>} />
      <Route path="/order" element={<ResponsiveLayout><OrderRedirect /></ResponsiveLayout>} />
      <Route path="/track-order" element={<ResponsiveLayout><OrderTracking /></ResponsiveLayout>} />
      <Route path="/track-order/:orderId" element={<ResponsiveLayout><OrderTracking /></ResponsiveLayout>} />
      <Route path="/invoice/:orderId" element={<Suspense fallback={<div>Loading...</div>}><InvoicePage /></Suspense>} />
      <Route path="/correct-order/:orderId" element={<Suspense fallback={<div>Loading...</div>}><CorrectionPage /></Suspense>} />
      {/* 🔒 END CORE E-COMMERCE ROUTES 🔒 */}
      
      {/* Store routes wrapped with CartProvider and proper error handling */}
      <Route path="/store/:storeName" element={
        <StorePageWrapper>
          <Suspense fallback={<StorefrontFallback />}>
            <Storefront />
          </Suspense>
        </StorePageWrapper>
      } />
      <Route path="/store/:storeName/product/:productSlug" element={
        <StorePageWrapper>
          <Suspense fallback={<ProductDetailsFallback />}>
            <ProductDetails />
          </Suspense>
        </StorePageWrapper>
      } />
      <Route path="/store/:storeName/cart" element={
        <StorePageWrapper>
          <Suspense fallback={<StorefrontFallback />}>
            <Cart />
          </Suspense>
        </StorePageWrapper>
      } />
      <Route path="/store/:storeName/checkout" element={
        <StorePageWrapper>
          <Suspense fallback={<StorefrontFallback />}>
            <Checkout />
          </Suspense>
        </StorePageWrapper>
      } />
      
      {/* Protected routes with responsive wrapper */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <ResponsiveLayout><Onboarding /></ResponsiveLayout>
        </ProtectedRoute>
      } />
      <Route path="/store-builder" element={
        <ProtectedRoute>
          <ResponsiveLayout><StoreBuilder /></ResponsiveLayout>
        </ProtectedRoute>
      } />
      <Route path="/embed-generator" element={
        <ProtectedRoute>
          <ResponsiveLayout><EmbedGenerator /></ResponsiveLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<DashboardLayout><Outlet /></DashboardLayout>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="orders" element={<Orders />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="customize-store" element={<CustomizeStore />} />
              <Route path="instagram" element={<InstagramAutomation />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="bank-details" element={<BankDetails />} />
            </Route>
          </Routes>
        </ProtectedRoute>
      } />

      {/* Enhanced 404 route - must be last */}
      <Route path="*" element={<ResponsiveLayout><NotFound /></ResponsiveLayout>} />
    </Routes>
  );
};

// Main App component with properly nested providers and global error boundary
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <StoreProvider>
                <AppContent />
                <Toaster />
                <Sonner />
              </StoreProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
