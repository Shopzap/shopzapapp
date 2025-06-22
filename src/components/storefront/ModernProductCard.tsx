
import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

interface ModernProductCardProps {
  product: Tables<'products'>;
  storeName: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

const ModernProductCard: React.FC<ModernProductCardProps> = memo(({
  product,
  storeName,
  buttonColor = '#6c5ce7',
  buttonTextColor = '#FFFFFF'
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProductClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the add to cart button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Navigate to product details page with proper routing
    const productRoute = `/store/${storeName}/product/${product.id}`;
    console.log('Navigating to product:', productRoute);
    navigate(productRoute);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const displayImage = product.image_url || 'https://placehold.co/300x300?text=No+Image';

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border border-gray-100"
      onClick={handleProductClick}
    >
      <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden relative">
        {!imageLoaded && !imageError && (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-xs">Loading...</div>
          </div>
        )}
        <img
          src={displayImage}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(Number(product.price))}
          </span>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="text-xs px-3 py-1 h-8"
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
});

ModernProductCard.displayName = 'ModernProductCard';

export default ModernProductCard;
