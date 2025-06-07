
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
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
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { isReservedPath, extractStoreSlug } from "./utils/routeHelpers";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

// Component to handle dynamic routing logic
const DynamicRouter = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  // Handle root path
  if (segments.length === 0) {
    return <Index />;
  }
  
  const firstSegment = segments[0];
  
  // Handle reserved paths (admin/dashboard routes)
  if (isReservedPath(firstSegment)) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/store-builder" element={<ProtectedRoute><StoreBuilder /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/track-order/:orderId" element={<OrderTracking />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }
  
  // Handle store routes (/{storeName}, /{storeName}/about, etc.)
  const storeSlug = extractStoreSlug(pathname);
  if (storeSlug) {
    if (segments.length === 1) {
      // /{storeName} - Storefront
      return <Storefront />;
    } else if (segments[1] === 'about') {
      // /{storeName}/about
      return <StorefrontAbout />;
    } else if (segments[1] === 'cart') {
      // /{storeName}/cart
      return <Cart />;
    } else if (segments[1] === 'checkout') {
      // /{storeName}/checkout
      return <Checkout />;
    } else {
      // /{storeName}/{productSlug} - Product details
      return <ProductDetails />;
    }
  }
  
  return <NotFound />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DynamicRouter />
            </BrowserRouter>
          </TooltipProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
