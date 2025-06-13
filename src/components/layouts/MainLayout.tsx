
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, BarChart2, Users, Menu, X, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-white shadow-md">
        <h1 className="text-2xl font-bold text-purple-700">ShopZap.io</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="p-4 border-b hidden md:block">
          <h1 className="text-2xl font-bold text-purple-700">ShopZap.io</h1>
        </div>
        <div className="p-4 flex items-center space-x-3 border-b">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold">shaikh sadique</p>
            <p className="text-sm text-gray-500">Logged in</p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-2 rounded-md ${isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsSidebarOpen(false)} // Close sidebar on navigation
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={async () => {
              try {
                await supabase.auth.signOut({ scope: 'global' });
                window.location.href = '/';
              } catch (error) {
                console.error('Error signing out:', error);
              }
            }} 
            className="flex items-center space-x-3 p-2 text-red-500 hover:bg-red-50 rounded-md w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Content Area - Enhanced spacing */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 xl:p-12">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
