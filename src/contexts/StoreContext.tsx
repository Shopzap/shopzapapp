
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

console.log('StoreContext: Loading StoreContext');

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
  console.log('StoreContext: Rendering StoreProvider');
  
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      console.log('StoreContext: fetchStore called, isLoadingAuth:', isLoadingAuth, 'user:', !!user);
      
      if (isLoadingAuth) {
        console.log('StoreContext: Still loading auth, waiting...');
        return; // Wait for auth to load
      }

      if (!user) {
        console.log('StoreContext: No user, clearing store data');
        setStoreId(null);
        setStoreData(null);
        setIsLoadingStore(false);
        return;
      }

      try {
        console.log('StoreContext: Fetching store for user:', user.id);
        setIsLoadingStore(true);
        
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('StoreContext: Error fetching store (user may not have store yet):', error.message);
          // Handle case where user might not have a store yet
          setStoreId(null);
          setStoreData(null);
        } else if (data) {
          console.log('StoreContext: Store data received:', data.id);
          setStoreId(data.id);
          setStoreData(data);
        } else {
          console.log('StoreContext: No store found for user');
          // No store found for the user
          setStoreId(null);
          setStoreData(null);
        }
      } catch (err) {
        console.error('StoreContext: Unexpected error fetching store:', err);
        setStoreId(null);
        setStoreData(null);
      } finally {
        setIsLoadingStore(false);
      }
    }

    fetchStore();
  }, [user, isLoadingAuth]);

  const value = {
    storeId,
    storeData,
    isLoadingStore,
  };

  console.log('StoreContext: Providing store context, storeId:', storeId, 'loading:', isLoadingStore);

  return (
    <StoreContext.Provider value={value}>
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
