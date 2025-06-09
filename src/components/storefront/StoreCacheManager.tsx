
import { useEffect, useCallback } from 'react';

interface StoreCacheData {
  store: any;
  products: any[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useStoreCache = (storeName: string) => {
  const getCacheKey = useCallback((name: string) => `store_cache_${name}`, []);

  const getCachedData = useCallback((name: string): StoreCacheData | null => {
    try {
      const cached = localStorage.getItem(getCacheKey(name));
      if (!cached) return null;

      const data: StoreCacheData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(getCacheKey(name));
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading store cache:', error);
      return null;
    }
  }, [getCacheKey]);

  const setCachedData = useCallback((name: string, store: any, products: any[]) => {
    try {
      const cacheData: StoreCacheData = {
        store,
        products,
        timestamp: Date.now()
      };
      localStorage.setItem(getCacheKey(name), JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting store cache:', error);
    }
  }, [getCacheKey]);

  const clearCache = useCallback((name: string) => {
    localStorage.removeItem(getCacheKey(name));
  }, [getCacheKey]);

  return {
    getCachedData,
    setCachedData,
    clearCache
  };
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload common fonts
  const fontPreloads = [
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  ];

  fontPreloads.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = fontUrl;
    document.head.appendChild(link);
  });
};
