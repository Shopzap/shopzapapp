
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Brain } from 'lucide-react';
import { useSmartPricing } from '@/hooks/useSmartPricing';

interface SmartPricingBadgeProps {
  category?: string;
}

export const SmartPricingBadge: React.FC<SmartPricingBadgeProps> = ({ category }) => {
  const { suggestedPrice, isLoading, isDismissed, dismiss } = useSmartPricing(category);

  if (!category || isDismissed || (!suggestedPrice && !isLoading)) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mt-1">
      <div className="flex items-center gap-2 text-sm text-blue-700">
        <Brain className="h-4 w-4" />
        {isLoading ? (
          <span>Calculating suggested price...</span>
        ) : (
          <span>🧠 Suggested Price: ₹{suggestedPrice}</span>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={dismiss}
        className="h-auto p-1 text-blue-600 hover:text-blue-800"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
