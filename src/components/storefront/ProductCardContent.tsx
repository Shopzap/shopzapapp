
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { Tables } from '@/integrations/supabase/types';

interface ProductCardContentProps {
  product: Tables<'products'>;
  onViewDetails: () => void;
  formatPrice: (price: number) => string;
}

const ProductCardContent: React.FC<ProductCardContentProps> = ({
  product,
  onViewDetails,
  formatPrice
}) => {
  return (
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
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
        <AddToCartButton product={product} />
      </div>
    </CardContent>
  );
};

export default ProductCardContent;
