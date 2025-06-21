
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart, 
  Settings, 
  Store,
  FileText,
  CreditCard,
  Building2
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { storeData } = useStore();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart,
    },
    {
      title: 'Invoices',
      href: '/dashboard/invoices',
      icon: FileText,
    },
    {
      title: 'Payouts',
      href: '/dashboard/payouts',
      icon: CreditCard,
    },
    {
      title: 'Bank Details',
      href: '/dashboard/bank-details',
      icon: Building2,
    },
    {
      title: 'Customize Store',
      href: '/dashboard/customize-store',
      icon: Store,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">
              {storeData?.name || 'Dashboard'}
            </h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
