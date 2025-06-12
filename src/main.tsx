

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

const queryClient = new QueryClient();

// Wrapper component to provide Auth and Store contexts inside Router
const AppWrapper = () => (
  <AuthProvider>
    <StoreProvider>
      <RouterProvider router={router} />
      <Toaster />
    </StoreProvider>
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary><div>Something went wrong</div></ErrorBoundary>,
  },
  {
    path: "/store/:storeId",
    element: <Storefront />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/order-success",
    element: <OrderSuccess />,
  },
  {
    path: "/orders",
    element: <Orders />,
  },
  {
    path: "/analytics",
    element: <Analytics />,
  },
  {
    path: "/track",
    element: <OrderTracking />,
  },
  {
    path: "/track-order/:orderId",
    element: <OrderTracking />,
  },
  {
    path: "/fix-order/:orderId",
    element: <FixOrder />,
  },
  {
    path: "/invoice/:orderId",
    element: <div>Invoice page - To be implemented</div>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWrapper />
    </QueryClientProvider>
  </React.StrictMode>,
)

