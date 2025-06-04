
import React, { useState } from 'react';
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
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      size={size}
      variant={variant}
      className="w-full"
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
  );
};

export default AddToCartButton;
