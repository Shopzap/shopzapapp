
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo & Store Name */}
            <Link to={`/store/${storeName}`} className="flex items-center space-x-3">
              {store.logo_image ? (
                <img 
                  src={store.logo_image} 
                  alt={store.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                {store.name}
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to={`/store/${storeName}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                Shop
              </Link>
              <Link to={`/store/${storeName}/about`} className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
            </nav>

            {/* Search & Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button>
              
              <Link to={`/store/${storeName}/cart`}>
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
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
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  to={`/store/${storeName}`} 
                  className="text-gray-600 hover:text-gray-900 transition-colors py-2 border-b border-gray-100"
                  onClick={closeMobileMenu}
                >
                  Shop
                </Link>
                <Link 
                  to={`/store/${storeName}/about`} 
                  className="text-gray-600 hover:text-gray-900 transition-colors py-2 border-b border-gray-100 flex items-center"
                  onClick={closeMobileMenu}
                >
                  <Info className="h-4 w-4 mr-2" />
                  About Store
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start px-0 py-2"
                  onClick={closeMobileMenu}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
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
