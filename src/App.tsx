
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const Storefront = lazy(() => import("./pages/Storefront"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
import Checkout from "./pages/Checkout";

// Auth components
import { AuthProvider } from "./contexts/AuthContext"; 
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./components/layouts/MainLayout";

const queryClient = new QueryClient();

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
    <Route path="/store/:storeName" element={
      <Suspense fallback={<div>Loading Store...</div>}>
        <Storefront />
      </Suspense>
    } />
    <Route path="/product/:productId" element={
      <Suspense fallback={<div>Loading Product...</div>}>
        <ProductDetails />
      </Suspense>
    } />
    <Route path="/checkout" element={<Checkout />} />
    
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
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductManager />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customize-store" element={<CustomizeStore />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainLayout>
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
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
