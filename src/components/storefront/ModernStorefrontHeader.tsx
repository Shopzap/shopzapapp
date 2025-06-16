
import React, { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Link, useParams } from 'react-router-dom';

interface ModernStorefrontHeaderProps {
  store: {
    id: string;
    name: string;
    logo_image: string | null;
  };
}

const ModernStorefrontHeader: React.FC<ModernStorefrontHeaderProps> = ({ store }) => {
  const { storeName } = useParams();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo & Store Name */}
            <Link to={`/store/${storeName}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              {store.logo_image ? (
                <img 
                  src={store.logo_image} 
                  alt={store.name}
                  className="h-10 w-10 rounded-2xl object-cover shadow-md border border-gray-200"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-md">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {store.name}
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Powered by ShopZap
                </div>
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to={`/store/${storeName}`} 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
              <Link 
                to={`/store/${storeName}/about`} 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Search & Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-gray-100 rounded-xl">
                <Search className="h-5 w-5" />
              </Button>
              
              <Link to={`/store/${storeName}/cart`}>
                <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-xl transition-all duration-200">
                  <ShoppingBag className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={closeMobileMenu}></div>
          <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl">
            <nav className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                <Link 
                  to={`/store/${storeName}`} 
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors py-3 px-4 rounded-xl hover:bg-gray-50 font-medium"
                  onClick={closeMobileMenu}
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Shop Products
                </Link>
                <Link 
                  to={`/store/${storeName}/about`} 
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors py-3 px-4 rounded-xl hover:bg-gray-50 font-medium"
                  onClick={closeMobileMenu}
                >
                  <Info className="h-5 w-5 mr-3" />
                  About Store
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start py-3 px-4 rounded-xl hover:bg-gray-50 font-medium text-gray-700 hover:text-blue-600"
                  onClick={closeMobileMenu}
                >
                  <Search className="h-5 w-5 mr-3" />
                  Search Products
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default ModernStorefrontHeader;
