
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface StorefrontProductCardProps {
  product: Tables<"products">;
  viewMode?: 'grid' | 'list';
}

const StorefrontProductCard: React.FC<StorefrontProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For mobile compatibility, navigate to checkout with product
    navigate('/checkout', {
      state: {
        orderItems: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image_url || '/placeholder.svg'
        }]
      }
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${product.id}`;
    
    if (navigator.share) {
      // Use native share API on mobile
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: productUrl,
        });
        toast.success('Product shared successfully!');
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm"
        onClick={handleViewDetails}
      >
        <div className="flex">
          <div className="relative w-32 h-32 flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleShare} variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleQuickAdd} className="bg-gray-900 hover:bg-gray-800">
                  Add to Cart
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white"
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gray-50 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
        
        {/* Hover overlay with actions - Desktop only */}
        <div className={`absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 hidden md:block ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-white hover:bg-gray-100 shadow-md"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-white hover:bg-gray-100 shadow-md"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-white hover:bg-gray-100 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          
          {/* Quick add button on hover */}
          <div className="absolute bottom-3 left-3 right-3">
            <Button
              className={`w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 ${
                isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
              onClick={handleQuickAdd}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Mobile action buttons - Always visible */}
        <div className="absolute top-2 right-2 flex gap-1 md:hidden">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3 text-gray-600" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
            onClick={handleWishlist}
          >
            <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3 md:p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 text-sm md:text-base">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</span>
          
          {/* Mobile Add to Cart Button */}
          <Button
            size="sm"
            onClick={handleQuickAdd}
            className="md:hidden bg-gray-900 hover:bg-gray-800 text-xs px-2 py-1"
          >
            Add
          </Button>
          
          {/* Desktop rating placeholder */}
          <div className="hidden md:flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorefrontProductCard;
