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
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Appearance from "./pages/Appearance";
import OrderTracking from "./pages/OrderTracking";
import FixOrder from "./pages/FixOrder";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
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
    path: "/cart",
    element: <Cart />,
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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/orders",
    element: <Orders />,
  },
  {
    path: "/customers",
    element: <Customers />,
  },
  {
    path: "/analytics",
    element: <Analytics />,
  },
  {
    path: "/appearance",
    element: <Appearance />,
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
      <AuthProvider>
        <StoreProvider>
          <RouterProvider router={router} />
          <Toaster />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
