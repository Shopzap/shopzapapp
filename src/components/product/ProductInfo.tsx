
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, ShoppingBag } from 'lucide-react';

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string | null;
  };
  formatPrice: (price: number) => string;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onShare: () => void;
  onWishlist: () => void;
  isWishlisted: boolean;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  formatPrice,
  onAddToCart,
  onBuyNow,
  onShare,
  onWishlist,
  isWishlisted,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const sizes = ['S', 'M', 'L', 'XL'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <Badge variant="outline">In Stock</Badge>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Size Selection */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Size</h3>
        <div className="flex gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSize(size)}
              className="w-12 h-12"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={() => onBuyNow()}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          Buy Now - {formatPrice(product.price * quantity)}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onWishlist}
          >
            <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            Wishlist
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onShare}
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
