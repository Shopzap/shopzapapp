
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  Palette, 
  BarChart3,
  Instagram,
  Crown
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const location = useLocation();
  const { currentStore } = useStore();
  
  const isPro = currentStore?.plan === 'pro';

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Instagram Automation',
      href: '/dashboard/instagram-automation',
      icon: Instagram,
      isPro: false, // Available for all plans
    },
    {
      name: 'Customize Store',
      href: '/dashboard/customize-store',
      icon: Palette,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      isPro: true,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">ShopZap</h1>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const isDisabled = item.isPro && !isPro;
              
              return (
                <Link
                  key={item.name}
                  to={isDisabled ? '#' : item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                  {item.isPro && !isPro && (
                    <Crown className="w-4 h-4 ml-auto text-yellow-500" />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {currentStore && (
            <div className="px-4 py-4 border-t">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{currentStore.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentStore.plan} Plan</p>
                </div>
                {isPro && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
