
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
      // For now, use the stores table since that's what exists
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching seller profile:', error);
      }

      // Map stores data to seller profile format
      if (data) {
        const mappedProfile: SellerProfile = {
          id: data.id,
          user_id: data.user_id,
          business_name: data.name,
          business_description: data.description,
          contact_email: data.business_email,
          contact_phone: data.phone_number,
          avatar_url: data.logo_image,
          banner_url: data.banner_image,
          is_verified: false, // Default for now
          is_onboarding_complete: !!data.name, // Consider onboarding complete if name exists
          social_links: data.social_media_links || {},
          return_policy: null
        };
        setSellerProfile(mappedProfile);
      } else {
        setSellerProfile(null);
      }
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
