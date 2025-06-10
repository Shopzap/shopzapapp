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
const Storefront = lazy(() => import("./pages/Storefront"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
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

const queryClient = new QueryClient();

// Store pages wrapper with CartProvider
const StorePageWrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>
    {children}
  </CartProvider>
);

// Create a separate App component wrapper to ensure proper provider nesting
const AppContent = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/features" element={<Features />} />
    <Route path="*" element={<NotFound />} />

    {/* Existing routes, potentially nested under MainLayout or ProtectedRoute */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/verify" element={<Verify />} /> 
    <Route path="/auth-callback" element={<AuthCallback />} />
    
    {/* Store routes wrapped with CartProvider */}
    <Route path="/store/:storeName" element={
      <StorePageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div><p className="mt-4 text-muted-foreground">Loading store...</p></div>}>
            <Storefront />
          </Suspense>
        </ErrorBoundary>
      </StorePageWrapper>
    } />
    <Route path="/store/:storeName/product/:productSlug" element={
      <StorePageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div><p className="mt-4 text-muted-foreground">Loading product...</p></div>}>
            <ProductDetails />
          </Suspense>
        </ErrorBoundary>
      </StorePageWrapper>
    } />
    <Route path="/store/:storeName/cart" element={
      <StorePageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div><p className="mt-4 text-muted-foreground">Loading cart...</p></div>}>
            <Checkout />
          </Suspense>
        </ErrorBoundary>
      </StorePageWrapper>
    } />
    
    {/* Other cart/checkout related routes */}
    <Route path="/checkout" element={
      <CartProvider>
        <Checkout />
      </CartProvider>
    } />
    <Route path="/order-success" element={<OrderSuccess />} />
    <Route path="/order" element={<OrderRedirect />} />
    <Route path="/track-order" element={<OrderTracking />} />
    
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
            <Route path="customize-store" element={<CustomizeStore />} />
            <Route path="instagram" element={<InstagramAutomation />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </ProtectedRoute>
    } />
  </Routes>
);

// Main App component with properly nested providers
const App = () => (
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

export default App;
