import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface StoreData {
  id: string;
  name: string;
  // Add other store properties as needed
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
          .select('id, name')
          .eq('user_id', user.id)
          .single();

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