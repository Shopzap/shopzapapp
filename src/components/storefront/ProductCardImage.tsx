
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProductCardImageProps {
  imageUrl: string;
  productName: string;
  inventoryCount?: number;
}

const ProductCardImage: React.FC<ProductCardImageProps> = ({
  imageUrl,
  productName,
  inventoryCount
}) => {
  return (
    <div className="aspect-square overflow-hidden relative">
      <img
        src={imageUrl}
        alt={productName}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {/* Stock indicator */}
      {inventoryCount !== undefined && inventoryCount <= 5 && (
        <div className="absolute bottom-2 left-2">
          <Badge variant="destructive" className="text-xs">
            Only {inventoryCount} left
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ProductCardImage;
