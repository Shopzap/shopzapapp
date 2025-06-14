import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from 'react-error-boundary'
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { QueryClient } from 'react-query';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Storefront from './pages/Storefront';
import ProductDetail from './pages/ProductDetail';
import ProtectedRoute from './components/ProtectedRoute';
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

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <StoreProvider>
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Toaster />
              <ErrorBoundary>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/" element={<Storefront />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  
                  {/* New Dashboard Routes */}
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
          </Router>
        </StoreProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
