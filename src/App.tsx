
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import { CartProvider } from "./hooks/useCart";
import ErrorBoundary from './components/ErrorBoundary';
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Help from "./pages/Help";
import Tutorials from "./pages/Tutorials";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import PricingPolicy from "./pages/PricingPolicy";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Verify from "./pages/Verify";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ProductManager from "./pages/ProductManager";
import Orders from "./pages/Orders";
import DashboardOrders from "./pages/DashboardOrders";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import CustomizeStore from "./pages/CustomizeStore";
import StoreBuilder from "./pages/StoreBuilder";
import StoreThemes from "./pages/StoreThemes";
import EmbedGenerator from "./pages/EmbedGenerator";
import EmbedButton from "./pages/EmbedButton";
import Storefront from "./pages/Storefront";
import StorefrontAbout from "./pages/StorefrontAbout";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import OrderSuccess from "./pages/OrderSuccess";
import ThankYou from "./pages/ThankYou";
import PaymentFailed from "./pages/PaymentFailed";
import OrderTracking from "./pages/OrderTracking";
import OrderRedirect from "./pages/OrderRedirect";
import Invoices from "./pages/Invoices";
import InstagramAutomation from "./pages/InstagramAutomation";
import InstagramAutomationTest from "./pages/InstagramAutomationTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <StoreProvider>
              <CartProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/tutorials" element={<Tutorials />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/pricing-policy" element={<PricingPolicy />} />

                  {/* Auth routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/verify" element={<Verify />} />

                  {/* Dashboard routes - All with MainLayout */}
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/products" element={<ProductManager />} />
                  <Route path="/dashboard/orders" element={<DashboardOrders />} />
                  <Route path="/dashboard/analytics" element={<Analytics />} />
                  <Route path="/dashboard/settings" element={<Settings />} />
                  <Route path="/dashboard/customize-store" element={<CustomizeStore />} />
                  <Route path="/dashboard/automation" element={<InstagramAutomation />} />
                  <Route path="/dashboard/automation/test-send" element={<InstagramAutomationTest />} />
                  
                  {/* Legacy dashboard routes for backward compatibility */}
                  <Route path="/products" element={<ProductManager />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/customize" element={<CustomizeStore />} />
                  <Route path="/store-builder" element={<StoreBuilder />} />
                  <Route path="/themes" element={<StoreThemes />} />
                  <Route path="/embed" element={<EmbedGenerator />} />
                  <Route path="/embed-button" element={<EmbedButton />} />
                  <Route path="/invoices" element={<Invoices />} />
                  
                  {/* Instagram Automation routes */}
                  <Route path="/instagram-automation" element={<InstagramAutomation />} />

                  {/* Storefront routes - Using username instead of slug */}
                  <Route path="/store/:storeUsername" element={<Storefront />} />
                  <Route path="/store/:storeUsername/about" element={<StorefrontAbout />} />
                  <Route path="/store/:storeUsername/product/:productSlug" element={<ProductDetails />} />
                  <Route path="/store/:storeUsername/cart" element={<Cart />} />
                  <Route path="/store/:storeUsername/checkout" element={<Checkout />} />
                  
                  {/* Legacy cart redirect */}
                  <Route path="/cart" element={<Cart />} />
                  
                  {/* Checkout and order routes */}
                  <Route path="/checkout/:storeUsername" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} />
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="/order/:orderId" element={<OrderRedirect />} />

                  {/* 404 route - Must be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </StoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
