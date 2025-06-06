
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import ProductImageCarousel from './ProductImageCarousel';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[];
  payment_method?: string;
  stores?: {
    name: string;
    tagline?: string;
  };
}

interface ProductDetailsContentProps {
  product: Product;
  handleBuyNow: () => void;
  handleBack: () => void;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  handleBuyNow,
  handleBack
}) => {
  // Get images array, fallback to single image_url if images array is empty
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.image_url ? [product.image_url] : []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="w-full">
            <ProductImageCarousel 
              images={productImages}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Store Info */}
            {product.stores && (
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg">{product.stores.name}</h3>
                {product.stores.tagline && (
                  <p className="text-muted-foreground">{product.stores.tagline}</p>
                )}
              </div>
            )}

            {/* Product Details */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(product.price)}
              </p>
              
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Payment Method */}
              {product.payment_method && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Payment Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.payment_method === 'both' ? (
                      <>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Online Payment
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          Cash on Delivery
                        </span>
                      </>
                    ) : product.payment_method === 'cash' ? (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Cash on Delivery
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Online Payment
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Buy Button */}
            <div className="sticky bottom-4 bg-background pt-4 border-t">
              <Button 
                onClick={handleBuyNow}
                className="w-full py-6 text-lg font-semibold"
                size="lg"
              >
                Buy Now - {formatPrice(product.price)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;
