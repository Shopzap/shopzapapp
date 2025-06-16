
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
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-100">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <h1 className="text-2xl font-bold text-center">ShopZap</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          <header className="bg-white shadow border-b">
            <div className="flex items-center justify-between py-6 px-4 sm:px-6 lg:px-8">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1" />
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
          <main className="flex-1">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
