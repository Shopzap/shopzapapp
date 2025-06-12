
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Storefront from "./pages/Storefront";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import OrderTracking from "./pages/OrderTracking";
import FixOrder from "./pages/FixOrder";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Verify from "./pages/Verify";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

// Layout component that provides contexts inside the router
const RootLayout = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <Outlet />
        <Toaster />
      </StoreProvider>
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundary><div>Something went wrong</div></ErrorBoundary>,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "store/:storeId",
        element: <Storefront />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "order-success",
        element: <OrderSuccess />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "track",
        element: <OrderTracking />,
      },
      {
        path: "track-order/:orderId",
        element: <OrderTracking />,
      },
      {
        path: "fix-order/:orderId",
        element: <FixOrder />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "auth-callback",
        element: <AuthCallback />,
      },
      {
        path: "verify",
        element: <Verify />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "invoice/:orderId",
        element: <div>Invoice page - To be implemented</div>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
