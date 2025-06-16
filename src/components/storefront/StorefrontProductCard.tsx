
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import ProductCardActions from './ProductCardActions';
import ProductCardImage from './ProductCardImage';
import ProductCardContent from './ProductCardContent';
import ProductCardListView from './ProductCardListView';

interface StorefrontProductCardProps {
  product: Tables<'products'>;
  viewMode?: 'grid' | 'list';
}

const StorefrontProductCard: React.FC<StorefrontProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const storeUsername = location.pathname.split('/store/')[1]?.split('/')[0];
  const productSlug = product.slug || product.id;
  
  const handleViewDetails = () => {
    if (storeUsername && productSlug) {
      console.log('Navigating to product:', { storeUsername, productSlug });
      navigate(`/store/${storeUsername}/product/${productSlug}`);
    } else {
      console.error('Missing store username or product slug:', { storeUsername, productSlug });
      toast.error('Unable to navigate to product details');
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/store/${storeUsername}/product/${productSlug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name}`,
          url: productUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageUrl = product.image_url || '/placeholder.svg';

  if (viewMode === 'list') {
    return (
      <ProductCardListView
        product={product}
        isWishlisted={isWishlisted}
        onWishlist={handleWishlist}
        onShare={handleShare}
        onViewDetails={handleViewDetails}
        formatPrice={formatPrice}
        imageUrl={imageUrl}
      />
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full bg-white">
      <div className="aspect-square overflow-hidden relative">
        <ProductCardImage
          imageUrl={imageUrl}
          productName={product.name}
          inventoryCount={product.inventory_count}
        />
        <ProductCardActions
          isWishlisted={isWishlisted}
          onWishlist={handleWishlist}
          onShare={handleShare}
          onViewDetails={handleViewDetails}
          productName={product.name}
          productPrice={product.price}
        />
      </div>
      <ProductCardContent
        product={product}
        onViewDetails={handleViewDetails}
        formatPrice={formatPrice}
      />
    </Card>
  );
};

export default StorefrontProductCard;
