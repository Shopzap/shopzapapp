
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, ShoppingCart, Home, Info, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate, useLocation } from 'react-router-dom';

interface StorefrontNavbarProps {
  storeName: string;
}

const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({ storeName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const cartItemCount = getItemCount();
  const isAboutPage = location.pathname.includes('/about');

  const handleNavigation = (path: string) => {
    if (path === 'products') {
      // Scroll to products section if on main store page
      if (!isAboutPage) {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/store/${storeName}`);
      }
    } else {
      navigate(path);
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    {
      label: 'Shop',
      path: `/store/${storeName}`,
      icon: Home,
      active: !isAboutPage
    },
    {
      label: 'About',
      path: `/store/${storeName}/about`,
      icon: Info,
      active: isAboutPage
    },
    {
      label: 'Products',
      path: 'products',
      icon: Package,
      active: false
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Store Name */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation(`/store/${storeName}`)}
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              {storeName}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Single Cart Button */}
            <Button
              variant="outline"
              onClick={() => handleNavigation(`/store/${storeName}/cart`)}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile menu button and cart */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation(`/store/${storeName}/cart`)}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 touch-target"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="py-4 space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-md transition-colors touch-target ${
                      item.active
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default StorefrontNavbar;
