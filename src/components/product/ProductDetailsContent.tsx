
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, CreditCard, Truck, Eye, Share2, Calendar } from 'lucide-react';
import ProductImageCarousel from './ProductImageCarousel';

interface ProductDetailsContentProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    images?: string[];
    inventory_count?: number;
    status: string;
    payment_method?: string;
    store_name?: string;
    slug?: string;
    is_published?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  handleBuyNow: () => void;
  handleBack: () => void;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  handleBuyNow,
  handleBack,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'cash': return 'Cash on Delivery Only';
      case 'online': return 'Online Payment Only';
      case 'both': return 'Online Payment & Cash on Delivery';
      default: return 'Payment method not specified';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Available</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Unavailable</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
    ? [product.image_url] 
    : [];

  const isOutOfStock = product.inventory_count === 0;
  const isLowStock = product.inventory_count !== undefined && product.inventory_count > 0 && product.inventory_count <= 5;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 md:py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm md:text-base"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 text-sm md:text-base"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <ProductImageCarousel images={images} productName={product.name} />
            ) : (
              <div className="bg-accent rounded-lg overflow-hidden flex items-center justify-center h-[300px] md:h-[400px] lg:h-[500px]">
                <div className="text-muted-foreground flex flex-col items-center">
                  <Eye className="h-8 w-8 md:h-12 md:w-12 mb-2" />
                  <span className="text-sm md:text-base">No image available</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {getStatusBadge(product.status)}
                {isOutOfStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                {isLowStock && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Only {product.inventory_count} left
                  </Badge>
                )}
                {product.is_published === false && (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
            </div>

            <div className="text-3xl md:text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg md:text-xl font-medium mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base lg:text-lg">{product.description}</p>
              </div>
            )}

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              {product.inventory_count !== undefined && (
                <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                  <Package className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-base md:text-lg">Stock Available</p>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {product.inventory_count} units in stock
                    </p>
                    {isLowStock && (
                      <p className="text-sm md:text-base text-orange-600 font-medium">
                        Low stock - order soon!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {product.payment_method && (
                <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                  <CreditCard className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-base md:text-lg">Payment Options</p>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {getPaymentMethodText(product.payment_method)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                <Truck className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium text-base md:text-lg">Delivery</p>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Free delivery available
                  </p>
                </div>
              </div>
            </div>

            {/* Buy Now Button */}
            <div className="space-y-4 pt-4">
              <Button 
                size="lg" 
                className="w-full text-base md:text-lg py-4 md:py-6 h-auto font-semibold" 
                onClick={handleBuyNow}
                disabled={isOutOfStock || product.status !== 'active'}
              >
                {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </Button>
              
              {isOutOfStock && (
                <p className="text-sm md:text-base text-muted-foreground text-center">
                  This item is currently out of stock
                </p>
              )}
              
              {isLowStock && !isOutOfStock && (
                <p className="text-sm md:text-base text-orange-600 text-center font-medium">
                  Hurry! Only {product.inventory_count} items left in stock
                </p>
              )}
            </div>

            {/* Store Info */}
            {product.store_name && (
              <div className="border-t pt-6">
                <p className="text-sm md:text-base text-muted-foreground">
                  Sold by <span className="font-medium text-foreground">{product.store_name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsContent;
