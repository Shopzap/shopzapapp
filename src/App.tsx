
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from 'react-error-boundary'
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Storefront from './pages/Storefront';
import ProductDetails from './pages/ProductDetails';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/dashboard';
import ProductsPage from './pages/dashboard/products';
import OrdersPage from './pages/dashboard/orders';
import CustomizePage from './pages/dashboard/customize';
import InstagramPage from './pages/dashboard/instagram';
import AnalyticsPage from './pages/dashboard/analytics';
import ReviewsPage from './pages/dashboard/reviews';
import ReferralsPage from './pages/dashboard/referrals';
import AcademyPage from './pages/dashboard/academy';
import SettingsPage from './pages/dashboard/settings';
import PlanPage from './pages/dashboard/plan';

const queryClient = new QueryClient();

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <StoreProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Toaster />
              <ErrorBoundary fallbackRender={ErrorFallback}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/store/:storeName" element={<Storefront />} />
                  <Route path="/product/:productId" element={<ProductDetails />} />
                  
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/dashboard/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/dashboard/customize" element={<ProtectedRoute><CustomizePage /></ProtectedRoute>} />
                  <Route path="/dashboard/instagram" element={<ProtectedRoute><InstagramPage /></ProtectedRoute>} />
                  <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/academy" element={<ProtectedRoute><AcademyPage /></ProtectedRoute>} />
                  <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
                </Routes>
              </ErrorBoundary>
            </div>
          </StoreProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

// Simple HomePage component
function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ShopZap</h1>
        <p className="text-lg text-gray-600 mb-8">Your WhatsApp store solution</p>
        <div className="space-y-4">
          <a
            href="/auth"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
          <a
            href="/dashboard"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
