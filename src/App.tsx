
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

// Lazy loaded components
const Storefront = lazy(() => import("./pages/Storefront"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));

// Core e-commerce pages - CRITICAL ROUTES - DO NOT REMOVE
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderRedirect from "./pages/OrderRedirect";

// Auth components
import { AuthProvider } from "./contexts/AuthContext"; 
import { StoreProvider } from './contexts/StoreContext';
import { CartProvider } from './hooks/useCart';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/layouts/DashboardLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Store pages wrapper with CartProvider
const StorePageWrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>
    {children}
  </CartProvider>
);

// Global cart page wrapper with CartProvider
const GlobalCartWrapper = () => (
  <CartProvider>
    <Cart />
  </CartProvider>
);

// Checkout wrapper with CartProvider
const CheckoutWrapper = () => (
  <CartProvider>
    <Checkout />
  </CartProvider>
);

// Loading component
const LoadingFallback = ({ text = "Loading..." }: { text?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
    <p className="mt-4 text-muted-foreground">{text}</p>
  </div>
);

// Create a separate App component wrapper to ensure proper provider nesting
const AppContent = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/features" element={<Features />} />

    {/* Legal and info pages */}
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/refund" element={<RefundPolicy />} />
    <Route path="/shipping" element={<ShippingPolicy />} />
    <Route path="/pricing-policy" element={<PricingPolicy />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/help" element={<Help />} />
    <Route path="/tutorials" element={<Tutorials />} />
    <Route path="/store-themes" element={<StoreThemes />} />
    <Route path="/embed-button" element={<EmbedButton />} />

    {/* Auth routes */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/verify" element={<Verify />} /> 
    <Route path="/auth-callback" element={<AuthCallback />} />
    
    {/* 🔒 CORE E-COMMERCE ROUTES - CRITICAL - DO NOT REMOVE OR MODIFY 🔒 */}
    {/* Global cart route - handles both store-specific and general cart access */}
    <Route path="/cart" element={<GlobalCartWrapper />} />
    
    {/* Checkout route - CRITICAL FOR PAYMENTS */}
    <Route path="/checkout" element={<CheckoutWrapper />} />
    
    {/* Order completion routes */}
    <Route path="/order-success" element={<OrderSuccess />} />
    <Route path="/thank-you" element={<ThankYou />} />
    <Route path="/order" element={<OrderRedirect />} />
    <Route path="/track-order" element={<OrderTracking />} />
    <Route path="/track-order/:orderId" element={<OrderTracking />} />
    {/* 🔒 END CORE E-COMMERCE ROUTES 🔒 */}
    
    {/* Store routes wrapped with CartProvider */}
    <Route path="/store/:storeName" element={
      <StorePageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback text="Loading store..." />}>
            <Storefront />
          </Suspense>
        </ErrorBoundary>
      </StorePageWrapper>
    } />
    <Route path="/store/:storeName/product/:productSlug" element={
      <StorePageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback text="Loading product..." />}>
            <ProductDetails />
          </Suspense>
        </ErrorBoundary>
      </StorePageWrapper>
    } />
    <Route path="/store/:storeName/cart" element={
      <StorePageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback text="Loading cart..." />}>
            <Cart />
          </Suspense>
        </ErrorBoundary>
      </StorePageWrapper>
    } />
    <Route path="/store/:storeName/checkout" element={
      <StorePageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback text="Loading checkout..." />}>
            <Checkout />
          </Suspense>
        </ErrorBoundary>
      </StorePageWrapper>
    } />
    
    {/* Protected routes */}
    <Route path="/onboarding" element={
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    } />
    <Route path="/store-builder" element={
      <ProtectedRoute>
        <StoreBuilder />
      </ProtectedRoute>
    } />
    <Route path="/embed-generator" element={
      <ProtectedRoute>
        <EmbedGenerator />
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
          </Route>
        </Routes>
      </ProtectedRoute>
    } />

    {/* Catch-all route - must be last */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Main App component with properly nested providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <StoreProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
              <Toaster />
              <Sonner />
            </StoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
