import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, BarChart2, Users } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Products', icon: Package, path: '/dashboard/products' },
    { name: 'Orders', icon: ShoppingCart, path: '/dashboard/orders' },
    { name: 'Customize Store', icon: Settings, path: '/dashboard/customize-store' },
    { name: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
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
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link to="/logout" className="flex items-center space-x-3 p-2 text-red-500 hover:bg-red-50 rounded-md">
            <Home className="w-5 h-5" /> {/* Using Home icon as a placeholder for Logout */}
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;