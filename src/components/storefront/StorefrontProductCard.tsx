
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import AddToCartButton from './AddToCartButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface StorefrontProductCardProps {
  product: Tables<'products'>;
  viewMode?: 'grid' | 'list';
}

const StorefrontProductCard: React.FC<StorefrontProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Extract store slug from current path
  const storeSlug = location.pathname.split('/store/')[1]?.split('/')[0];
  
  // Create product slug from product name - make it more URL-friendly
  const productSlug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Remove leading/trailing whitespace
  
  const handleViewDetails = () => {
    if (storeSlug) {
      navigate(`/store/${storeSlug}/product/${productSlug}`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/store/${storeSlug}/product/${productSlug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name}`,
          url: productUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageUrl = product.image_url || '/placeholder.svg';

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow mb-4">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start h-full">
              <div className="flex-1 mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 sm:line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatPrice(Number(product.price))}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {product.status}
                  </Badge>
                  {product.inventory_count !== undefined && product.inventory_count <= 5 && (
                    <Badge variant="destructive" className="text-xs">
                      Only {product.inventory_count} left
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 sm:ml-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDetails}
                  className="flex items-center gap-2 flex-1 sm:flex-none"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlist}
                  className={`flex-1 sm:flex-none ${isWishlisted ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex-1 sm:flex-none"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <div className="flex-1 sm:flex-none">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleWishlist}
            className={`p-2 ${isWishlisted ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="p-2"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        {/* Stock indicator */}
        {product.inventory_count !== undefined && product.inventory_count <= 5 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive" className="text-xs">
              Only {product.inventory_count} left
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-grow">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            {formatPrice(Number(product.price))}
          </span>
          <Badge variant="secondary" className="text-xs">
            {product.status}
          </Badge>
        </div>
        {/* Display inventory count */}
        {product.inventory_count !== undefined && (
          <div className="mb-3">
            <span className="text-xs text-gray-600">
              {product.inventory_count > 0 
                ? `${product.inventory_count} in stock` 
                : 'Out of stock'}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          <AddToCartButton product={product} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StorefrontProductCard;
