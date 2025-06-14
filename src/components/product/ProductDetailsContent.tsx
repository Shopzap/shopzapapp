
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Package, Store, Clock, CheckCircle } from 'lucide-react';
import ProductImageGallery from './ProductImageGallery';
import StoreInfo from './StoreInfo';
import ProductInfo from './ProductInfo';
import ProductFeatures from './ProductFeatures';

interface ProductDetailsContentProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    images?: string[];
    inventory_count?: number;
    store_name?: string;
    payment_method?: string;
    created_at?: string;
    updated_at?: string;
  };
  handleBuyNow: () => void;
  handleBack: () => void;
  isBuyingNow?: boolean;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  handleBuyNow,
  handleBack,
  isBuyingNow = false,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const allImages = [
    product.image_url,
    ...(product.images || [])
  ].filter(Boolean);

  const isInStock = !product.inventory_count || product.inventory_count > 0;
  const paymentMethod = product.payment_method || 'cod';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6 flex items-center gap-2 hover:bg-accent"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Store</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery
              images={allImages}
              productName={product.name}
              selectedIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  ₹{product.price.toLocaleString()}
                </div>
                
                {isInStock ? (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3" />
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Features */}
            <ProductFeatures 
              paymentMethod={paymentMethod}
              inventoryCount={product.inventory_count}
            />

            {/* Product Description */}
            {product.description && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Details
                  </h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {product.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buy Now Button */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50"
                onClick={handleBuyNow}
                disabled={!isInStock || isBuyingNow}
              >
                {isBuyingNow ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding to Cart...
                  </>
                ) : !isInStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now - ₹{product.price.toLocaleString()}
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Secure checkout • Free shipping • Easy returns
                </div>
              </div>
            </div>

            <Separator />

            {/* Store Information */}
            <StoreInfo 
              storeName={product.store_name}
              productId={product.id}
            />

            {/* Product Information */}
            <ProductInfo 
              product={product}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;
