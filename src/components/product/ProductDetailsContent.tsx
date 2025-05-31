import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductDetailsContentProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    stores: { name: string } | null;
  };
  handleBuyNow: () => void;
  handleBack: () => void;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  handleBuyNow,
  handleBack,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-accent rounded-lg overflow-hidden flex items-center justify-center h-[400px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground">No image available</div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mt-2">
              {formatPrice(product.price)}
            </p>

            {product.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div className="mt-8">
              <Button size="lg" className="w-full md:w-auto" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>

            <div className="mt-auto pt-8">
              <p className="text-sm text-muted-foreground">
                From {product.stores?.name || 'Store'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;