
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Store, Package, ShoppingBag, Palette, Settings, BarChart3, LogOut } from 'lucide-react';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Logged out successfully" });
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ 
        title: "Logout failed", 
        variant: "destructive" 
      });
    }
  };
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Store className="h-4 w-4 mr-2" /> },
    { label: 'Products', path: '/dashboard/products', icon: <Package className="h-4 w-4 mr-2" /> },
    { label: 'Orders', path: '/dashboard/orders', icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { label: 'Customize', path: '/dashboard/customize', icon: <Palette className="h-4 w-4 mr-2" /> },
    { label: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];
  
  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/dashboard';
  };

  return (
    <div className="flex h-screen bg-accent/10">
      {/* Sidebar for medium screens and up */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r p-4">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ShopZap.io</div>
          </Link>
        </div>
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2 px-4 rounded-md text-sm ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-accent/50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/30"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </aside>
      
      {/* Mobile navbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-background border-b p-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ShopZap</div>
          </Link>
          <Button variant="outline" size="sm" onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}>
            Menu
          </Button>
        </div>
        <div id="mobile-menu" className="hidden mt-3 border rounded-md overflow-hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2 px-4 ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/30 py-2 px-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
