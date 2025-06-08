
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Tables } from '@/integrations/supabase/types';

interface AddToCartButtonProps {
  product: Tables<'products'>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  showIcon?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  product, 
  size = 'default', 
  variant = 'default',
  showIcon = true 
}) => {
  const { addToCart } = useCart();
  const { storeName } = useParams<{ storeName: string }>();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
      
      // After adding to cart, ensure we have store context
      if (storeName) {
        localStorage.setItem('currentStore', storeName);
        localStorage.setItem('lastVisitedStore', storeName);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleGoToCart = () => {
    if (storeName) {
      navigate(`/store/${storeName}/cart`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleAddToCart}
        disabled={isAdding}
        size={size}
        variant={variant}
        className="flex-1"
      >
        {showIcon && (
          isAdding ? (
            <Plus className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )
        )}
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  );
};

export default AddToCartButton;
