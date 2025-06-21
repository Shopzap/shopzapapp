
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, BarChart2, Users, Menu, X, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Products', icon: Package, path: '/dashboard/products' },
    { name: 'Orders', icon: ShoppingCart, path: '/dashboard/orders' },
    { name: 'Customize Store', icon: Settings, path: '/dashboard/customize-store' },
    { name: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm z-30 relative">
        <Link to="/" className="text-xl font-bold text-purple-700">
          ShopZap.io
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none lg:w-64",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Desktop Logo */}
        <div className="hidden lg:block p-4 border-b">
          <Link to="/" className="text-xl font-bold text-purple-700">
            ShopZap.io
          </Link>
        </div>

        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <Link to="/" onClick={closeSidebar} className="text-xl font-bold text-purple-700">
            ShopZap.io
          </Link>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center space-x-3 border-b bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">shaikh sadique</p>
            <p className="text-xs text-gray-500">Logged in</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-purple-100 text-purple-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t">
          <button 
            onClick={handleSignOut}
            className="flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg w-full text-left text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden lg:overflow-auto">
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
