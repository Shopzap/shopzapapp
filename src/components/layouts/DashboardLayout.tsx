import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, FileText, Palette, Instagram, TrendingUp, Menu, X } from 'lucide-react';

const DashboardLayout: React.FC = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">
                  ShopZap
                </Link>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/dashboard'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/products"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/dashboard/products'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </Link>
                <Link
                  to="/dashboard/orders"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/dashboard/orders'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Orders
                </Link>
                <Link
                  to="/dashboard/invoices"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/dashboard/invoices'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Invoices
                </Link>
                <Link
                  to="/dashboard/customize-store"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/dashboard/customize-store'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Customize
                </Link>
                <Link
                  to="/dashboard/instagram"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/dashboard/instagram'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </Link>
                <Link
                  to="/dashboard/analytics"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/dashboard/analytics'
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="relative flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={toggleMobileMenu}
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                      <span className="text-sm font-medium leading-none text-white">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                    </span>
                  </button>
                </div>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                  onClick={toggleMobileMenu}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="space-y-1 pt-2 pb-3">
            <Link
              to="/dashboard"
              className={`block py-2 pl-3 pr-4 text-base font-medium ${
                location.pathname === '/dashboard'
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/products"
              className={`block py-2 pl-3 pr-4 text-base font-medium ${
                location.pathname === '/dashboard/products'
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Products
            </Link>
            <Link
              to="/dashboard/orders"
              className={`block py-2 pl-3 pr-4 text-base font-medium ${
                location.pathname === '/dashboard/orders'
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Orders
            </Link>
            <Link
              to="/dashboard/invoices"
              className={`block py-2 pl-3 pr-4 text-base font-medium ${
                location.pathname === '/dashboard/invoices'
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Invoices
            </Link>
            <Link
              to="/dashboard/customize-store"
              className={`block py-2 pl-3 pr-4 text-base font-medium ${
                location.pathname === '/dashboard/customize-store'
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Customize
            </Link>
            <Link
              to="/dashboard/instagram"
              className={`block py-2 pl-3 pr-4 text-base font-medium ${
                location.pathname === '/dashboard/instagram'
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Instagram
            </Link>
            <Link
              to="/dashboard/analytics"
              className={`block py-2 pl-3 pr-4 text-base font-medium ${
                location.pathname === '/dashboard/analytics'
                  ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
