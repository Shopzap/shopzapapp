
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Share2, Instagram, Facebook } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface StorefrontNavbarProps {
  storeName: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}

const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({ 
  storeName, 
  socialLinks = {} 
}) => {
  const { items } = useCart();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Store Name */}
          <Link 
            to={`/store/${storeName}`}
            className="font-bold text-xl text-primary hover:text-primary/80"
          >
            {storeName}
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to={`/store/${storeName}`}
              className="text-gray-700 hover:text-primary font-medium"
            >
              Products
            </Link>
            <Link 
              to={`/store/${storeName}/about`}
              className="text-gray-700 hover:text-primary font-medium"
            >
              About
            </Link>
          </div>

          {/* Social Media & Actions */}
          <div className="flex items-center space-x-3">
            {/* Social Media Links */}
            {socialLinks.instagram && (
              <a 
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {socialLinks.facebook && (
              <a 
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}

            {/* Wishlist Button */}
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Share Button */}
            <Button variant="ghost" size="sm">
              <Share2 className="h-5 w-5" />
            </Button>

            {/* Cart Button */}
            <Link to={`/store/${storeName}/cart`}>
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex justify-center space-x-8">
            <Link 
              to={`/store/${storeName}`}
              className="text-gray-700 hover:text-primary font-medium"
            >
              Products
            </Link>
            <Link 
              to={`/store/${storeName}/about`}
              className="text-gray-700 hover:text-primary font-medium"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StorefrontNavbar;
