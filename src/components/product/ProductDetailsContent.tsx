
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StoreHeader from '@/components/storefront/StoreHeader';
import ProductImageGallery from '@/components/storefront/ProductImageGallery';
import CTAButtons from '@/components/storefront/CTAButtons';

interface ProductDetailsContentProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    images?: string[];
    status: string;
    stores?: {
      id: string;
      name: string;
      logo_image: string | null;
      tagline: string | null;
      primary_color?: string;
    };
  };
  handleBuyNow: () => void;
  handleBack: () => void;
  onAddToCart?: () => void;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  handleBuyNow,
  handleBack,
  onAddToCart
}) => {
  const { storeName } = useParams<{ storeName: string }>();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare images array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
    ? [product.image_url] 
    : [];

  // Store data for header
  const store = product.stores ? {
    ...product.stores,
    primary_color: product.stores.primary_color || '#6c5ce7'
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {store && <StoreHeader store={store} />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <ProductImageGallery 
                images={productImages}
                productName={product.name}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {product.status}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <div className="text-3xl font-bold text-primary mb-6">
                  {formatPrice(Number(product.price))}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {product.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <CTAButtons
                onAddToCart={onAddToCart}
                onBuyNow={handleBuyNow}
                price={Number(product.price)}
                className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border"
              />

              {/* Additional Actions */}
              <div className="flex items-center gap-4 pt-6 border-t">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              {/* Store Info */}
              {store && (
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-semibold mb-2">Sold by</h4>
                  <div className="flex items-center gap-3">
                    {store.logo_image ? (
                      <img 
                        src={store.logo_image} 
                        alt={store.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: store.primary_color }}
                      >
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{store.name}</p>
                      {store.tagline && (
                        <p className="text-sm text-gray-600">{store.tagline}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;
