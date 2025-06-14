
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp } from 'lucide-react';
import { useSmartPricing } from '@/hooks/useSmartPricing';

interface SmartPricingBadgeProps {
  category?: string;
}

export const SmartPricingBadge: React.FC<SmartPricingBadgeProps> = ({ category }) => {
  const { suggestedPrice, isLoading, isDismissed, dismiss } = useSmartPricing(category);

  if (isDismissed || !suggestedPrice || isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <Badge variant="secondary" className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Suggested: ₹{suggestedPrice.toLocaleString()}
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={dismiss}
        className="h-5 w-5 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
