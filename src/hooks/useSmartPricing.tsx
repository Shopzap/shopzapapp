
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface SmartPricingData {
  suggestedPrice: number | null;
  isLoading: boolean;
  isDismissed: boolean;
  dismiss: () => void;
}

export const useSmartPricing = (category?: string): SmartPricingData => {
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (category && !isDismissed) {
      fetchSuggestedPrice(category);
    }
  }, [category, isDismissed]);

  const fetchSuggestedPrice = async (category: string) => {
    setIsLoading(true);
    try {
      // Get average price for similar products (simplified approach)
      const { data, error } = await supabase
        .from('products')
        .select('price')
        .ilike('name', `%${category}%`)
        .gt('price', 0)
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const prices = data.map(p => Number(p.price));
        const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        setSuggestedPrice(Math.round(averagePrice));
      }
    } catch (error) {
      console.error('Error fetching suggested price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismiss = () => {
    setIsDismissed(true);
    setSuggestedPrice(null);
  };

  return {
    suggestedPrice,
    isLoading,
    isDismissed,
    dismiss
  };
};
