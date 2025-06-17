
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
  Zap,
  DollarSign,
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
      description: "Overview & analytics",
      color: "from-blue-500 to-blue-600"
    },
    { 
      icon: Package, 
      label: "Products", 
      path: "/dashboard/products",
      description: "Inventory management",
      color: "from-green-500 to-green-600"
    },
    { 
      icon: ShoppingCart, 
      label: "Orders", 
      path: "/dashboard/orders",
      description: "Sales tracking",
      color: "from-orange-500 to-orange-600"
    },
    { 
      icon: FileText, 
      label: "Invoices", 
      path: "/dashboard/invoices",
      description: "Billing & payments",
      color: "from-purple-500 to-purple-600"
    },
    { 
      icon: DollarSign, 
      label: "Payouts", 
      path: "/dashboard/payouts",
      description: "Earnings & payouts",
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      icon: Palette, 
      label: "Customize Store", 
      path: "/dashboard/customize-store",
      description: "Design & branding",
      color: "from-pink-500 to-pink-600"
    },
    { 
      icon: Instagram, 
      label: "Instagram", 
      path: "/dashboard/instagram",
      description: "Social automation",
      color: "from-gradient-to-r from-purple-500 to-pink-500"
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      path: "/dashboard/analytics",
      description: "Performance insights",
      color: "from-indigo-500 to-indigo-600"
    },
    { 
      icon: CreditCard, 
      label: "Bank Details", 
      path: "/dashboard/bank-details",
      description: "Payment setup",
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/dashboard/settings",
      description: "Account preferences",
      color: "from-gray-500 to-gray-600"
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-gray-100">
        <Sidebar className="border-r border-gray-200/60 bg-white shadow-xl">
          <SidebarHeader className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <img 
                    src="/lovable-uploads/91b33ff6-9d83-497a-b2d1-bdca4c9139e2.png" 
                    alt="ShopZap Logo" 
                    className="w-8 h-8"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-2 h-2 text-yellow-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  ShopZap
                </h1>
                <p className="text-xs text-blue-100 font-medium">E-commerce Platform</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-6 space-y-2">
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    className={`w-full group relative rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md'
                    }`}
                    size="lg"
                  >
                    <div className="flex items-center gap-4 w-full py-2">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 group-hover:text-white'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                      </div>
                      {isActive(item.path) && (
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    {isActive(item.path) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-gray-100 bg-gray-50/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-3 h-auto rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10 border-3 border-gray-200 group-hover:border-blue-300 transition-colors">
                      {user?.user_metadata?.avatar_url ? (
                        <AvatarImage src={user.user_metadata.avatar_url} alt={user?.user_metadata?.full_name as string} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                          {(user?.user_metadata?.full_name as string)?.substring(0, 2).toUpperCase() || <Skeleton className="w-10 h-10 rounded-full" />}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm text-gray-900">
                        {user?.user_metadata?.full_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 font-semibold">
                      Pro
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mr-4 shadow-xl border-gray-200" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer focus:text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
            <div className="flex items-center justify-between py-4 px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden bg-gray-100 hover:bg-gray-200 rounded-lg p-2" />
                <div className="hidden md:block">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {menuItems.find(item => isActive(item.path))?.description || 'Welcome back to your dashboard'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden sm:flex text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                  🟢 Store Live
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full hover:bg-gray-100">
                      <Avatar className="h-8 w-8 border border-gray-200">
                        {user?.user_metadata?.avatar_url ? (
                          <AvatarImage src={user.user_metadata.avatar_url} alt={user?.user_metadata?.full_name as string} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                            {(user?.user_metadata?.full_name as string)?.substring(0, 2).toUpperCase() || <Skeleton className="w-8 h-8 rounded-full" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 shadow-xl" align="end" forceMount>
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>Profile Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          <main className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100 min-h-[calc(100vh-73px)]">
            <div className="max-w-7xl mx-auto py-8 px-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
