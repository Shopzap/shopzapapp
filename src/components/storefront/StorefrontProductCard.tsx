
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';
import AddToCartButton from './AddToCartButton';

interface StorefrontProductCardProps {
  product: Tables<'products'>;
  viewMode?: 'grid' | 'list';
}

const StorefrontProductCard: React.FC<StorefrontProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
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
              <div className="ml-6 flex flex-col justify-between h-full">
                <div></div>
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
        <AddToCartButton product={product} />
      </CardContent>
    </Card>
  );
};

export default StorefrontProductCard;
