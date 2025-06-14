
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  totalVisits: number;
  conversions: number;
  orders: number;
  conversionRate: number;
  isLoading: boolean;
}

export const useReferralStats = (storeId: string) => {
  const [stats, setStats] = useState<ReferralStats>({
    totalVisits: 0,
    conversions: 0,
    orders: 0,
    conversionRate: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!storeId) return;
      
      try {
        // Get all referrals for this store
        const { data: referrals, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_store_id', storeId);
        
        if (error) throw error;
        
        const totalVisits = referrals?.length || 0;
        const conversions = referrals?.filter(r => r.status === 'converted').length || 0;
        const orders = referrals?.filter(r => r.order_id).length || 0;
        const conversionRate = totalVisits > 0 ? (conversions / totalVisits) * 100 : 0;
        
        setStats({
          totalVisits,
          conversions,
          orders,
          conversionRate,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching referral stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchStats();
  }, [storeId]);
  
  return stats;
};
