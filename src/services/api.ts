import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : 'https://shopzap.io/api';

// Helper function to get the auth token
const getAuthToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

// Helper function for API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }
  
  return response.json();
};

// Store Settings API
export const storeSettingsApi = {
  // Get store settings
  getStoreSettings: async (storeId: string): Promise<Tables<"stores">> => {
    return apiRequest(`/store/${storeId}/settings`, {
      method: 'GET',
    });
  },
  
  // Update store information
  updateStoreInfo: async (storeId: string, data: {
    storeName: string;
    storeDescription: string;
    storeLogoUrl?: string;
    storeBannerUrl?: string;
  }) => {
    return apiRequest(`/store/${storeId}/updateStoreInfo`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update account information
  updateAccount: async (storeId: string, data: {
    username: string;
    email: string;
  }) => {
    return apiRequest(`/store/${storeId}/updateAccount`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Change password
  changePassword: async (storeId: string, data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    return apiRequest(`/store/${storeId}/changePassword`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update branding
  updateBranding: async (storeId: string, data: {
    subdomain: string;
    brandColor: string;
  }) => {
    return apiRequest(`/store/${storeId}/updateBranding`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update contact information
  updateContact: async (storeId: string, data: {
    businessEmail: string;
    phoneNumber: string;
    socialLinks: {
      whatsapp?: string;
      instagram?: string;
      facebook?: string;
    };
  }) => {
    return apiRequest(`/store/${storeId}/updateContact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Delete store
  deleteStore: async (storeId: string) => {
    return apiRequest(`/store/${storeId}`, {
      method: 'DELETE',
    });
  },
};

// File Upload API
export const fileUploadApi = {
  // Upload logo
  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${API_URL}/upload/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Logo upload failed with status ${response.status}`);
    }
    
    return response.json();
  },
  
  // Upload banner
  uploadBanner: async (file: File): Promise<{ url: string }> => {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const formData = new FormData();
    formData.append('banner', file);
    
    const response = await fetch(`${API_URL}/upload/banner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Banner upload failed with status ${response.status}`);
    }
    
    return response.json();
  },
};

// Orders API
export const ordersApi = {
  // Create a new order
  createOrder: async (orderData: {
    storeId: string;
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerAddress?: string;
    totalPrice: number;
    items: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
    }[];
  }) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Update order status
  updateOrderStatus: async (orderId: string, data: {
    status: string;
    notes?: string;
    trackingNumber?: string;
    shippingCarrier?: string;
    estimatedDeliveryDate?: string;
  }) => {
    const result = await apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    // Send email notification for status updates
    try {
      const { emailService } = await import('@/services/emailService');
      
      // Get order details for email
      const { data: orderDetails } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_purchase,
            products (name)
          ),
          stores (name)
        `)
        .eq('id', orderId)
        .single();

      if (orderDetails && orderDetails.buyer_email) {
        const emailData = {
          buyerName: orderDetails.buyer_name,
          storeName: orderDetails.stores?.name || 'Store',
          items: orderDetails.order_items?.map((item: any) => ({
            name: item.products?.name || 'Product',
            quantity: item.quantity,
            price: item.price_at_purchase
          })) || [],
          totalPrice: orderDetails.total_price,
          trackingNumber: data.trackingNumber,
          estimatedDelivery: data.estimatedDeliveryDate
        };

        // Send appropriate email based on status
        switch (data.status) {
          case 'confirmed':
            await emailService.sendOrderConfirmedEmail(orderId, orderDetails.buyer_email, emailData);
            break;
          case 'shipped':
            await emailService.sendOrderShippedEmail(orderId, orderDetails.buyer_email, emailData);
            break;
          case 'delivered':
            await emailService.sendOrderDeliveredEmail(orderId, orderDetails.buyer_email, emailData);
            break;
          case 'cancelled':
            await emailService.sendOrderCancelledEmail(orderId, orderDetails.buyer_email, emailData);
            break;
        }
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the status update if email fails
    }

    return result;
  },

  // Get analytics data
  getAnalytics: async (storeId: string) => {
    return apiRequest(`/store/${storeId}/analytics`, {
      method: 'GET',
    });
  },
};
