
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import Verify from "./pages/Verify"; 
import AuthCallback from "./pages/AuthCallback";
import OrderTracking from "./pages/OrderTracking";
import Cart from "./pages/Cart";
const Storefront = lazy(() => import("./pages/Storefront"));
const StorefrontAboutPage = lazy(() => import("./pages/StorefrontAbout"));
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

// Reserved paths that should not be treated as store slugs
const RESERVED_PATHS = [
  'auth', 'login', 'signup', 'verify', 'auth-callback',
  'dashboard', 'onboarding', 'store-builder', 'embed-generator',
  'pricing', 'features', 'about', 'privacy', 'terms',
  'order-success', 'track-order', 'order', 'admin'
];

// Main App component with properly nested providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <ErrorBoundary>
                <Routes>
                  {/* Main homepage */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Reserved paths - Internal ShopZap pages */}
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/verify" element={<Verify />} /> 
                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/order" element={<OrderRedirect />} />

                  {/* Legacy store routes - redirect to new format */}
                  <Route path="/store/:storeSlug" element={<Navigate to="/:storeSlug" replace />} />
                  <Route path="/store/:storeSlug/about" element={<Navigate to="/:storeSlug/about" replace />} />
                  <Route path="/product/:productId" element={
                    <ErrorBoundary>
                      <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div><p className="mt-4 text-muted-foreground">Loading product...</p></div>}>
                        <ProductDetails />
                      </Suspense>
                    </ErrorBoundary>
                  } />

                  {/* Protected routes - Seller dashboard */}
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
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="settings" element={<Settings />} />
                        </Route>
                      </Routes>
                    </ProtectedRoute>
                  } />

                  {/* Store-specific routes - Dynamic store slug routing */}
                  <Route path="/:storeSlug" element={
                    <ErrorBoundary>
                      <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div><p className="mt-4 text-muted-foreground">Loading store...</p></div>}>
                        <Storefront />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/:storeSlug/about" element={
                    <ErrorBoundary>
                      <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div><p className="mt-4 text-muted-foreground">Loading about page...</p></div>}>
                        <StorefrontAboutPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/:storeSlug/cart" element={<Cart />} />
                  <Route path="/:storeSlug/checkout" element={<Checkout />} />
                  <Route path="/:storeSlug/:productSlug" element={
                    <ErrorBoundary>
                      <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div><p className="mt-4 text-muted-foreground">Loading product...</p></div>}>
                        <ProductDetails />
                      </Suspense>
                    </ErrorBoundary>
                  } />

                  {/* 404 catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
              <Toaster />
              <Sonner />
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
