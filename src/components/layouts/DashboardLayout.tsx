
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
  ChevronRight,
  User,
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
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const menuItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      path: "/dashboard",
      description: "Overview & stats"
    },
    { 
      icon: Package, 
      label: "Products", 
      path: "/dashboard/products",
      description: "Manage inventory"
    },
    { 
      icon: ShoppingCart, 
      label: "Orders", 
      path: "/dashboard/orders",
      description: "Track sales"
    },
    { 
      icon: FileText, 
      label: "Invoices", 
      path: "/dashboard/invoices",
      description: "Billing & payments"
    },
    { 
      icon: Palette, 
      label: "Customize Store", 
      path: "/dashboard/customize-store",
      description: "Design & branding"
    },
    { 
      icon: Instagram, 
      label: "Instagram", 
      path: "/dashboard/instagram",
      description: "Social automation"
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      path: "/dashboard/analytics",
      description: "Performance insights"
    },
    { 
      icon: CreditCard, 
      label: "Bank Details", 
      path: "/dashboard/bank-details",
      description: "Payment setup"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/dashboard/settings",
      description: "Account preferences"
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50/30">
        <Sidebar className="border-r border-gray-200/60 bg-white/95 backdrop-blur-sm">
          <SidebarHeader className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  ShopZap
                </h1>
                <p className="text-xs text-gray-500 font-medium">E-commerce Platform</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-4">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    className={`w-full group relative rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }`}
                    size="lg"
                  >
                    <div className="flex items-center gap-4 w-full py-1">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                      </div>
                      {isActive(item.path) && (
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-gray-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-3 h-auto rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-9 w-9 border-2 border-gray-200">
                      {user?.user_metadata?.avatar_url ? (
                        <AvatarImage src={user.user_metadata.avatar_url} alt={user?.user_metadata?.full_name as string} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {(user?.user_metadata?.full_name as string)?.substring(0, 2).toUpperCase() || <Skeleton className="w-9 h-9 rounded-full" />}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm text-gray-900">
                        {user?.user_metadata?.full_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Pro
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
            <div className="flex items-center justify-between py-4 px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden md:block">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {menuItems.find(item => isActive(item.path))?.description || 'Welcome back'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden sm:flex text-xs">
                  Live Store
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-8 w-8">
                        {user?.user_metadata?.avatar_url ? (
                          <AvatarImage src={user.user_metadata.avatar_url} alt={user?.user_metadata?.full_name as string} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold">
                            {(user?.user_metadata?.full_name as string)?.substring(0, 2).toUpperCase() || <Skeleton className="w-8 h-8 rounded-full" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          <main className="flex-1 bg-gray-50/30">
            <div className="max-w-7xl mx-auto py-6 px-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
