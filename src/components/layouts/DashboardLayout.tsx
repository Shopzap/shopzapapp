import React from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  Palette,
  Instagram,
  BarChart3,
  Settings,
  CreditCard,
} from 'lucide-react';
import { Sidebar } from "@/components/ui/sidebar"
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Products", path: "/dashboard/products" },
    { icon: ShoppingCart, label: "Orders", path: "/dashboard/orders" },
    { icon: FileText, label: "Invoices", path: "/dashboard/invoices" },
    { icon: Palette, label: "Customize Store", path: "/dashboard/customize-store" },
    { icon: Instagram, label: "Instagram", path: "/dashboard/instagram" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: CreditCard, label: "Bank Details", path: "/dashboard/bank-details" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar className="w-64 bg-white border-r">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center">ShopZap</h1>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100 w-full text-left ${isActive(item.path) ? 'bg-gray-100 font-medium' : ''
                  }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sidebar>
      <div className="md:ml-64">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-end items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none focus:outline-none rounded-full overflow-hidden w-10 h-10">
                  <Avatar>
                    {user?.user_metadata?.avatar_url ? (
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user?.user_metadata?.full_name as string} />
                    ) : (
                      <AvatarFallback>{(user?.user_metadata?.full_name as string)?.substring(0, 2).toUpperCase() || <Skeleton className="w-10 h-10 rounded-full" />}</AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
