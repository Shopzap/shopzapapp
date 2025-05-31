
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import StoreBuilder from "./pages/StoreBuilder";
import EmbedGenerator from "./pages/EmbedGenerator";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import MainLayout from "./components/MainLayout";
import ProductManager from "./pages/ProductManager";
import Orders from "./pages/Orders";
import CustomizeStore from "./pages/CustomizeStore";
import NotFound from "./pages/NotFound";
import Verify from "./pages/Verify"; 
import AuthCallback from "./pages/AuthCallback";
import Storefront from "./pages/Storefront";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";

// Auth components
import { AuthProvider } from "./contexts/AuthContext"; 
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// Create a separate App component wrapper to ensure proper provider nesting
const AppContent = () => (
  <Routes>
    <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
    <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
    <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
    {/* Keep other routes as they are, but they won't be wrapped by MainLayout unless explicitly done so */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/verify" element={<Verify />} /> 
    <Route path="/auth-callback" element={<AuthCallback />} />
    <Route path="/store/:storeName" element={<Storefront />} />
    <Route path="/product/:productId" element={<ProductDetails />} />
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
    <Route path="/dashboard/products" element={
      <ProtectedRoute>
        <ProductManager />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/orders" element={
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/customize-store" element={
      <ProtectedRoute>
        <CustomizeStore />
      </ProtectedRoute>
    } />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Main App component with properly nested providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
