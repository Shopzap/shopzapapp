
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Heart } from 'lucide-react';
import ShareButton from '@/components/product/ShareButton';

interface ProductCardActionsProps {
  isWishlisted: boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onViewDetails: () => void;
  productName: string;
  productPrice: number;
}

const ProductCardActions: React.FC<ProductCardActionsProps> = ({
  isWishlisted,
  onWishlist,
  onShare,
  onViewDetails,
  productName,
  productPrice
}) => {
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // The ShareButton component will handle the actual sharing
  };

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="sm"
        onClick={onWishlist}
        className={`p-2 ${isWishlisted ? 'text-red-500' : ''}`}
      >
        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </Button>
      <div onClick={handleShareClick}>
        <ShareButton 
          productName={productName}
          productPrice={productPrice}
          className="p-2"
        />
      </div>
    </div>
  );
};

export default ProductCardActions;
