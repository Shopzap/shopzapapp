
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import AddToCartButton from './AddToCartButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';

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

  const imageUrl = product.image_url || '/placeholder.svg';

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          <div className="w-48 h-32 flex-shrink-0">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="flex-1 p-6">
            <div className="flex justify-between items-start h-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {product.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="ml-6 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDetails}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
                <AddToCartButton product={product} />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <Badge variant="secondary" className="text-xs">
            {product.status}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
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
