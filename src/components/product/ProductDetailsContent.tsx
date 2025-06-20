
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share2, Heart } from 'lucide-react';
import { ProductVariant } from './types';
import VariantSelector from './VariantSelector';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[];
  category?: string;
  inventory_count?: number;
  status: string;
  product_type?: 'simple' | 'variant';
  variants?: ProductVariant[];
  store_name?: string;
}

interface ProductDetailsContentProps {
  product: Product;
  handleBuyNow: (selectedVariant?: ProductVariant) => void;
  handleBack: () => void;
  isBuyingNow?: boolean;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  handleBuyNow,
  handleBack,
  isBuyingNow = false
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentImage, setCurrentImage] = useState(product.image_url || '');

  const handleVariantSelect = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
    if (variant && variant.image_url) {
      setCurrentImage(variant.image_url);
    } else {
      setCurrentImage(product.image_url || '');
    }
  };

  const getCurrentPrice = () => {
    if (product.product_type === 'variant' && selectedVariant) {
      return selectedVariant.price;
    }
    return product.price;
  };

  const getCurrentStock = () => {
    if (product.product_type === 'variant' && selectedVariant) {
      return selectedVariant.inventory_count;
    }
    return product.inventory_count || 0;
  };

  const isOutOfStock = () => {
    return getCurrentStock() <= 0;
  };

  const canPurchase = () => {
    if (product.product_type === 'variant') {
      return selectedVariant && !isOutOfStock();
    }
    return !isOutOfStock();
  };

  const handleBuyNowClick = () => {
    if (product.product_type === 'variant' && selectedVariant) {
      handleBuyNow(selectedVariant);
    } else {
      handleBuyNow();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-6 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Store
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-gray-50">
            <img
              src={currentImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Additional Images */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setCurrentImage(product.image_url || '')}
                className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 border-gray-200 hover:border-gray-300"
              >
                <img
                  src={product.image_url || ''}
                  alt="Main"
                  className="w-full h-full object-cover"
                />
              </button>
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(image)}
                  className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 border-gray-200 hover:border-gray-300"
                >
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Store Info */}
          {product.store_name && (
            <div className="text-sm text-muted-foreground">
              Sold by <span className="font-medium">{product.store_name}</span>
            </div>
          )}

          {/* Product Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {product.category && (
              <Badge variant="secondary">{product.category}</Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">₹{getCurrentPrice()}</span>
            {isOutOfStock() && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
            {!isOutOfStock() && (
              <span className="text-sm text-green-600">{getCurrentStock()} in stock</span>
            )}
          </div>

          {/* Variant Selection */}
          {product.product_type === 'variant' && product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              onVariantSelect={handleVariantSelect}
              selectedVariant={selectedVariant}
            />
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleBuyNowClick}
              disabled={!canPurchase() || isBuyingNow}
              className="flex-1"
              size="lg"
            >
              {isBuyingNow ? (
                'Adding to Cart...'
              ) : isOutOfStock() ? (
                'Out of Stock'
              ) : product.product_type === 'variant' && !selectedVariant ? (
                'Select Options'
              ) : (
                `Buy Now - ₹${getCurrentPrice()}`
              )}
            </Button>
            
            <Button variant="outline" size="lg">
              <Heart className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="lg">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Variant Selection Warning */}
          {product.product_type === 'variant' && !selectedVariant && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please select all product options before purchasing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;
