
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayoutRequest {
  id: string;
  seller_id: string;
  store_id: string;
  total_earned: number;
  platform_fee: number;
  final_amount: number;
  order_ids: string[];
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  created_at: string;
  updated_at: string;
  week_start_date: string;
  week_end_date: string;
  paid_at?: string;
  admin_notes?: string;
}

export const usePayouts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch seller's payout requests
  const { data: payoutRequests, isLoading, error } = useQuery({
    queryKey: ['payoutRequests'],
    queryFn: async (): Promise<PayoutRequest[]> => {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  // Calculate total earned and pending amounts
  const totalEarned = payoutRequests?.reduce((sum, payout) => 
    payout.status === 'paid' ? sum + payout.final_amount : sum, 0) || 0;

  const pendingAmount = payoutRequests?.reduce((sum, payout) => 
    payout.status === 'pending' ? sum + payout.final_amount : sum, 0) || 0;

  const totalPlatformFees = payoutRequests?.reduce((sum, payout) => 
    sum + payout.platform_fee, 0) || 0;

  return {
    payoutRequests,
    isLoading,
    error,
    totalEarned,
    pendingAmount,
    totalPlatformFees,
    stats: {
      totalPayouts: payoutRequests?.length || 0,
      paidPayouts: payoutRequests?.filter(p => p.status === 'paid').length || 0,
      pendingPayouts: payoutRequests?.filter(p => p.status === 'pending').length || 0,
    }
  };
};
