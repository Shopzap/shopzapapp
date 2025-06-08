
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

interface StoreHeaderProps {
  store: {
    id: string;
    name: string;
    logo_image?: string | null;
    tagline?: string | null;
    primary_color?: string;
  };
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store }) => {
  const { storeName } = useParams<{ storeName: string }>();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  const primaryColor = store.primary_color || '#6c5ce7';

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Store Logo and Name */}
          <Link 
            to={`/store/${storeName}`}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            {store.logo_image ? (
              <img 
                src={store.logo_image} 
                alt={`${store.name} logo`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Store className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
              {store.tagline && (
                <p className="text-sm text-gray-600">{store.tagline}</p>
              )}
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to={`/store/${storeName}`}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
            <Link 
              to={`/store/${storeName}/about`}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Cart Button */}
          <Button asChild variant="outline" className="relative">
            <Link to={`/store/${storeName}/cart`}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartItemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
