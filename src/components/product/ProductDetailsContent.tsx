
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, MessageCircle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  store_name?: string;
  product_type?: string;
  payment_method?: string;
}

interface ProductDetailsContentProps {
  product: Product;
  handleBuyNow: (selectedVariant?: ProductVariant) => void;
  handleBack: () => void;
  isBuyingNow: boolean;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({
  product,
  handleBuyNow,
  handleBack,
  isBuyingNow
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentStock, setCurrentStock] = useState(product.inventory_count || 0);
  const [currentImage, setCurrentImage] = useState(product.image_url || '');

  // Fetch variants if this is a variant product
  const { data: variants = [] } = useQuery({
    queryKey: ['product-variants', product.id],
    queryFn: async () => {
      if (product.product_type !== 'variant') return [];
      
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id);
      
      if (error) {
        console.error('Error fetching variants:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: product.product_type === 'variant'
  });

  const isVariantProduct = product.product_type === 'variant' && variants.length > 0;

  // Update current display values when variant is selected
  useEffect(() => {
    if (selectedVariant) {
      setCurrentPrice(selectedVariant.price);
      setCurrentStock(selectedVariant.inventory_count);
      if (selectedVariant.image_url) {
        setCurrentImage(selectedVariant.image_url);
      }
    } else if (!isVariantProduct) {
      setCurrentPrice(product.price);
      setCurrentStock(product.inventory_count || 0);
      setCurrentImage(product.image_url || '');
    }
  }, [selectedVariant, product, isVariantProduct]);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [product.image_url] 
      : ['https://placehold.co/400x400'];

  const displayImages = currentImage && !images.includes(currentImage) 
    ? [currentImage, ...images] 
    : images;

  const getWhatsAppLink = () => {
    const message = selectedVariant
      ? `Hi! I'm interested in "${product.name}" - ${Object.values(selectedVariant.options).join(' / ')} (₹${currentPrice})`
      : `Hi! I'm interested in "${product.name}" (₹${currentPrice})`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const canAddToCart = () => {
    if (isVariantProduct) {
      return selectedVariant && selectedVariant.inventory_count > 0;
    }
    return currentStock > 0;
  };

  const handleBuyNowClick = () => {
    if (isVariantProduct && selectedVariant) {
      handleBuyNow(selectedVariant);
    } else if (!isVariantProduct) {
      handleBuyNow();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {displayImages.map((image, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="p-0">
                      <img
                        src={image || 'https://placehold.co/400x400'}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/400x400';
                        }}
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {displayImages.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={handleBack} className="mb-4 p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
            {product.store_name && (
              <p className="text-muted-foreground">by {product.store_name}</p>
            )}
            {product.category && (
              <Badge variant="secondary">{product.category}</Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-primary">₹{currentPrice.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Package className="h-4 w-4" />
              <span>
                {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Variant Selector */}
        {isVariantProduct && (
          <div className="space-y-4">
            <Separator />
            <VariantSelector
              variants={variants}
              onVariantSelect={setSelectedVariant}
              selectedVariant={selectedVariant}
            />
            <Separator />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleBuyNowClick}
            disabled={!canAddToCart() || isBuyingNow}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isBuyingNow ? 'Adding...' : !canAddToCart() ? 'Out of Stock' : 'Buy Now'}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-semibold">Why Choose Us</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm">Free delivery available</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Quality guaranteed</span>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="text-sm">24/7 WhatsApp support</span>
            </div>
          </div>
        </div>

        {/* Payment Method Info */}
        {product.payment_method && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Payment Options</h4>
            <p className="text-sm text-muted-foreground">
              {product.payment_method === 'cod' && 'Cash on Delivery available'}
              {product.payment_method === 'online' && 'Online payment only'}
              {product.payment_method === 'both' && 'Cash on Delivery & Online payment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsContent;
