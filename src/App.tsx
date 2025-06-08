import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ProductManager from "./pages/ProductManager";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import StoreBuilder from "./pages/StoreBuilder";
import Storefront from "./pages/Storefront";
import StorefrontAbout from "./pages/StorefrontAbout";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import CustomizeStore from "./pages/CustomizeStore";
import Analytics from "./pages/Analytics";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

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
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/store-builder" element={<ProtectedRoute><StoreBuilder /></ProtectedRoute>} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/track-order/:orderId" element={<OrderTracking />} />
                  
                  {/* Store routes with CartProvider - Updated for proper scoping */}
                  <Route path="/store/:storeName" element={
                    <CartProvider>
                      <Storefront />
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/about" element={
                    <CartProvider>
                      <StorefrontAbout />
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/cart" element={
                    <CartProvider>
                      <Cart />
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/checkout" element={
                    <CartProvider>
                      <Checkout />
                    </CartProvider>
                  } />
                  <Route path="/store/:storeName/product/:productSlug" element={
                    <CartProvider>
                      <ProductDetails />
                    </CartProvider>
                  } />
                  
                  {/* Dashboard routes with sidebar layout */}
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
                  
                  {/* Fallback - redirect invalid routes to home */}
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
