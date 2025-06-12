
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, CreditCard, Truck, Eye, Share2 } from 'lucide-react';
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
      // Fallback: copy to clipboard
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <ProductImageCarousel images={images} productName={product.name} />
            ) : (
              <div className="bg-accent rounded-lg overflow-hidden flex items-center justify-center h-[400px]">
                <div className="text-muted-foreground flex flex-col items-center">
                  <Eye className="h-12 w-12 mb-2" />
                  <span>No image available</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
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

            <div className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            {/* Product ID and SKU Info */}
            <div className="bg-accent/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Product Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Product ID:</span> {product.id}</p>
                {product.slug && (
                  <p><span className="font-medium">Product Slug:</span> {product.slug}</p>
                )}
                {product.created_at && (
                  <p><span className="font-medium">Created:</span> {new Date(product.created_at).toLocaleDateString()}</p>
                )}
                {product.updated_at && (
                  <p><span className="font-medium">Last Updated:</span> {new Date(product.updated_at).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              {product.inventory_count !== undefined && (
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Stock Available</p>
                    <p className="text-sm text-muted-foreground">
                      {product.inventory_count} units in stock
                    </p>
                    {isLowStock && (
                      <p className="text-sm text-orange-600 font-medium">
                        Low stock - order soon!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {product.payment_method && (
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Payment Options</p>
                    <p className="text-sm text-muted-foreground">
                      {getPaymentMethodText(product.payment_method)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Free delivery available
                  </p>
                </div>
              </div>
            </div>

            {/* Buy Now Button */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleBuyNow}
                disabled={isOutOfStock || product.status !== 'active'}
              >
                {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </Button>
              
              {isOutOfStock && (
                <p className="text-sm text-muted-foreground text-center">
                  This item is currently out of stock
                </p>
              )}
              
              {isLowStock && !isOutOfStock && (
                <p className="text-sm text-orange-600 text-center font-medium">
                  Hurry! Only {product.inventory_count} items left in stock
                </p>
              )}
            </div>

            {/* Store Info */}
            {product.store_name && (
              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
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
