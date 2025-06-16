
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BankDetails {
  id?: string;
  user_id?: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  pan_number: string;
  gst_number: string;
  payout_method: 'bank_transfer' | 'upi';
  created_at?: string;
  updated_at?: string;
}

export const useBankDetails = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bank details
  const { data: bankDetails, isLoading, error } = useQuery({
    queryKey: ['bankDetails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_details')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    },
  });

  // Save/Update bank details mutation
  const saveBankDetailsMutation = useMutation({
    mutationFn: async (bankData: Omit<BankDetails, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('bank_details')
        .upsert({
          user_id: user.id,
          ...bankData,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
      toast({
        title: "Success",
        description: "Bank details saved successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error saving bank details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save bank details",
        variant: "destructive",
      });
    },
  });

  // Delete bank details mutation
  const deleteBankDetailsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('bank_details')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
      toast({
        title: "Success",
        description: "Bank details deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting bank details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete bank details",
        variant: "destructive",
      });
    },
  });

  return {
    bankDetails,
    isLoading,
    error,
    saveBankDetails: saveBankDetailsMutation.mutate,
    deleteBankDetails: deleteBankDetailsMutation.mutate,
    isSaving: saveBankDetailsMutation.isPending,
    isDeleting: deleteBankDetailsMutation.isPending,
  };
};
