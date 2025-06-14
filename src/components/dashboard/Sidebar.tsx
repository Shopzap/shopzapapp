
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Package, 
  Box, 
  Paintbrush, 
  Instagram, 
  Activity, 
  Star, 
  Gift, 
  GraduationCap, 
  Settings, 
  BadgeCheck 
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Products", icon: Package, href: "/dashboard/products" },
  { label: "Orders", icon: Box, href: "/dashboard/orders" },
  { label: "Customize Store", icon: Paintbrush, href: "/dashboard/customize" },
  { label: "Instagram Automation", icon: Instagram, href: "/dashboard/instagram" },
  { label: "Analytics", icon: Activity, href: "/dashboard/analytics" },
  { label: "Reviews", icon: Star, href: "/dashboard/reviews" },
  { label: "Referrals & Bonuses", icon: Gift, href: "/dashboard/referrals" },
  { label: "Seller Academy", icon: GraduationCap, href: "/dashboard/academy" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  { label: "Plan", icon: BadgeCheck, href: "/dashboard/plan" }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ShopZap
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className={cn(
            "flex items-center space-x-3",
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">User</p>
                <p className="text-xs text-gray-500 truncate">Free Plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
