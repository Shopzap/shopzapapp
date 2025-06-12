
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Share2 } from 'lucide-react';

interface ProductCardActionsProps {
  isWishlisted: boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onViewDetails: () => void;
}

const ProductCardActions: React.FC<ProductCardActionsProps> = ({
  isWishlisted,
  onWishlist,
  onShare,
  onViewDetails
}) => {
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
      <Button
        variant="secondary"
        size="sm"
        onClick={onShare}
        className="p-2"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductCardActions;
