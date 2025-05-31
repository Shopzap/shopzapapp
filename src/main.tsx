import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import NotFound from './pages/NotFound.tsx';
import Auth from './pages/Auth.tsx';
import AuthCallback from './pages/AuthCallback.tsx';
import Checkout from './pages/Checkout.tsx';
import CustomizeStore from './pages/CustomizeStore.tsx';
import Dashboard from './pages/Dashboard.tsx';
import EmbedGenerator from './pages/EmbedGenerator.tsx';
import Index from './pages/Index.tsx';
import Onboarding from './pages/Onboarding.tsx';
import Orders from './pages/Orders.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import ProductManager from './pages/ProductManager.tsx';
import StoreBuilder from './pages/StoreBuilder.tsx';
import Storefront from './pages/Storefront.tsx';
import Verify from './pages/Verify.tsx';

createRoot(document.getElementById('root')!).render(
  <App />
);
