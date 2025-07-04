
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap } from 'lucide-react';

interface CTAButtonsProps {
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  price: number;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

const CTAButtons: React.FC<CTAButtonsProps> = ({
  onAddToCart,
  onBuyNow,
  price,
  disabled = false,
  className = "",
  variant = 'default'
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {onAddToCart && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddToCart}
            disabled={disabled}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        )}
        
        {onBuyNow && (
          <Button
            size="sm"
            onClick={onBuyNow}
            disabled={disabled}
            className="flex-1"
          >
            <Zap className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {onAddToCart && (
        <Button
          variant="outline"
          onClick={onAddToCart}
          disabled={disabled}
          className="flex-1"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      )}
      
      {onBuyNow && (
        <Button
          onClick={onBuyNow}
          disabled={disabled}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Zap className="w-4 h-4 mr-2" />
          Buy Now - {formatPrice(price)}
        </Button>
      )}
    </div>
  );
};

export default CTAButtons;
