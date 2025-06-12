
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Share2 } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { Tables } from '@/integrations/supabase/types';

interface ProductCardListViewProps {
  product: Tables<'products'>;
  isWishlisted: boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onViewDetails: () => void;
  formatPrice: (price: number) => string;
  imageUrl: string;
}

const ProductCardListView: React.FC<ProductCardListViewProps> = ({
  product,
  isWishlisted,
  onWishlist,
  onShare,
  onViewDetails,
  formatPrice,
  imageUrl
}) => {
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
                onClick={onViewDetails}
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onWishlist}
                className={`flex-1 sm:flex-none ${isWishlisted ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
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
};

export default ProductCardListView;
