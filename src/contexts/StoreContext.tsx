
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  logo_image: string | null;
  banner_image: string | null;
  username: string;
  business_email: string;
  phone_number: string;
  address: string | null;
  tagline: string | null;
  theme: any | null;
  is_active: boolean | null;
  plan: string;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface StoreContextType {
  storeId: string | null;
  storeData: StoreData | null;
  isLoadingStore: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      if (isLoadingAuth) return; // Wait for auth to load

      if (!user) {
        setStoreId(null);
        setStoreData(null);
        setIsLoadingStore(false);
        return;
      }

      try {
        setIsLoadingStore(true);
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching store:', error);
          // Handle case where user might not have a store yet
          setStoreId(null);
          setStoreData(null);
        } else if (data) {
          setStoreId(data.id);
          setStoreData(data);
        } else {
          // No store found for the user
          setStoreId(null);
          setStoreData(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching store:', err);
        setStoreId(null);
        setStoreData(null);
      } finally {
        setIsLoadingStore(false);
      }
    }

    fetchStore();
  }, [user, isLoadingAuth]);

  return (
    <StoreContext.Provider value={{ storeId, storeData, isLoadingStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
