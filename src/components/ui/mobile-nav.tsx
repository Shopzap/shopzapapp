
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  items: Array<{
    href: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  children?: React.ReactNode;
}

const MobileNav: React.FC<MobileNavProps> = ({ items, children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const closeNav = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          size="sm"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[280px] sm:w-[350px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={closeNav}
            >
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ShopZap.io
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeNav}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-col space-y-2 flex-1 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeNav}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Footer */}
          {children && (
            <div className="mt-auto pt-4 border-t">
              {children}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
