
export const LocalStorageKeys = {
  CART_BACKUP: 'shopzap_cart_backup',
  PRODUCT_FORM_DRAFT: 'shopzap_product_form_draft',
  CART_SESSION: 'cart_session_id',
  STORE_CONTEXT: 'shopzap_store_context',
  LAST_VISITED_STORE: 'lastVisitedStore'
} as const;

export const persistenceUtils = {
  // Generic localStorage helpers
  setItem: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  // Cart persistence
  saveCartBackup: (cartData: {
    sessionId: string;
    storeName?: string;
    itemCount: number;
    totalPrice: number;
    items?: any[];
  }) => {
    const backup = {
      ...cartData,
      timestamp: Date.now()
    };
    persistenceUtils.setItem(LocalStorageKeys.CART_BACKUP, backup);
  },

  getCartBackup: () => {
    return persistenceUtils.getItem<{
      sessionId: string;
      storeName?: string;
      itemCount: number;
      totalPrice: number;
      items?: any[];
      timestamp: number;
    }>(LocalStorageKeys.CART_BACKUP);
  },

  clearCartBackup: () => {
    persistenceUtils.removeItem(LocalStorageKeys.CART_BACKUP);
  },

  // Product form draft persistence
  saveProductFormDraft: (formData: any, storeId?: string) => {
    const draft = {
      formData,
      storeId,
      timestamp: Date.now()
    };
    persistenceUtils.setItem(LocalStorageKeys.PRODUCT_FORM_DRAFT, draft);
  },

  getProductFormDraft: (storeId?: string) => {
    const draft = persistenceUtils.getItem<{
      formData: any;
      storeId?: string;
      timestamp: number;
    }>(LocalStorageKeys.PRODUCT_FORM_DRAFT);

    // Only return draft if it's for the same store (or no store specified)
    if (draft && (!storeId || draft.storeId === storeId)) {
      // Check if draft is not too old (24 hours)
      const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000;
      return isRecent ? draft : null;
    }
    return null;
  },

  clearProductFormDraft: () => {
    persistenceUtils.removeItem(LocalStorageKeys.PRODUCT_FORM_DRAFT);
  }
};
