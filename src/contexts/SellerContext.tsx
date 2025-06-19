
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SellerProfile {
  id: string;
  user_id: string;
  business_name?: string;
  business_description?: string;
  contact_email?: string;
  contact_phone?: string;
  avatar_url?: string;
  banner_url?: string;
  is_verified: boolean;
  is_onboarding_complete: boolean;
  social_links?: any;
  return_policy?: string;
}

interface SellerContextType {
  sellerProfile: SellerProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const SellerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSellerProfile = async () => {
    if (!user) {
      setSellerProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching seller profile:', error);
      }

      setSellerProfile(data);
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchSellerProfile();
  };

  useEffect(() => {
    fetchSellerProfile();
  }, [user]);

  return (
    <SellerContext.Provider value={{ sellerProfile, isLoading, refreshProfile }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (context === undefined) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
