
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// For now, we'll use Supabase directly instead of the external API
// since the backend server endpoints are not available

// Helper function to get the auth token
const getAuthToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

// Store Settings API - Updated to use Supabase directly
export const storeSettingsApi = {
  // Get store settings
  getStoreSettings: async (storeId: string): Promise<Tables<"stores">> => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Update store information
  updateStoreInfo: async (storeId: string, data: {
    storeName: string;
    storeDescription: string;
    storeLogoUrl?: string;
    storeBannerUrl?: string;
  }) => {
    const { error } = await supabase
      .from('stores')
      .update({
        name: data.storeName,
        description: data.storeDescription,
        logo_image: data.storeLogoUrl,
        banner_image: data.storeBannerUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { message: 'Store information updated successfully' };
  },
  
  // Update account information
  updateAccount: async (storeId: string, data: {
    username: string;
    email: string;
  }) => {
    const { error } = await supabase
      .from('stores')
      .update({
        username: data.username,
        business_email: data.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { message: 'Account information updated successfully' };
  },
  
  // Change password
  changePassword: async (storeId: string, data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { message: 'Password changed successfully' };
  },
  
  // Update branding
  updateBranding: async (storeId: string, data: {
    subdomain: string;
    brandColor: string;
  }) => {
    // Get current store data to update theme
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('theme')
      .eq('id', storeId)
      .single();
    
    if (fetchError) {
      throw new Error(fetchError.message);
    }
    
    // Prepare theme object
    const currentTheme = storeData.theme || {};
    const updatedTheme = {
      ...currentTheme,
      primary_color: data.brandColor,
      subdomain: data.subdomain
    };
    
    const { error } = await supabase
      .from('stores')
      .update({
        theme: updatedTheme,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { message: 'Branding updated successfully' };
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
    // Get current store data to update theme
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('theme')
      .eq('id', storeId)
      .single();
    
    if (fetchError) {
      throw new Error(fetchError.message);
    }
    
    // Prepare theme object with social links
    const currentTheme = storeData.theme || {};
    const updatedTheme = {
      ...currentTheme,
      social_links: data.socialLinks
    };
    
    const { error } = await supabase
      .from('stores')
      .update({
        business_email: data.businessEmail,
        phone_number: data.phoneNumber,
        theme: updatedTheme,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { message: 'Contact information updated successfully' };
  },
  
  // Delete store
  deleteStore: async (storeId: string) => {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { message: 'Store deleted successfully' };
  },
};

// File Upload API - Updated to use Supabase Storage directly
export const fileUploadApi = {
  // Upload logo
  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('store_logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('store_logos')
      .getPublicUrl(filePath);
    
    return { url: publicUrlData.publicUrl };
  },
  
  // Upload banner
  uploadBanner: async (file: File): Promise<{ url: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('store_logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('store_logos')
      .getPublicUrl(filePath);
    
    return { url: publicUrlData.publicUrl };
  },
};

// Orders API - Updated to use Supabase directly
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
    // Create the order
    const { data: orderInsertData, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: orderData.storeId,
        buyer_name: orderData.buyerName,
        buyer_email: orderData.buyerEmail,
        buyer_phone: orderData.buyerPhone,
        buyer_address: orderData.buyerAddress,
        total_price: orderData.totalPrice,
        status: 'pending'
      })
      .select()
      .single();
    
    if (orderError) {
      throw new Error(orderError.message);
    }
    
    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: orderInsertData.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.priceAtPurchase
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', orderInsertData.id);
      throw new Error(itemsError.message);
    }
    
    return { 
      message: 'Order created successfully', 
      orderId: orderInsertData.id,
      order: orderInsertData 
    };
  },

  // Update order status
  updateOrderStatus: async (orderId: string, data: {
    status: string;
    notes?: string;
    trackingNumber?: string;
    shippingCarrier?: string;
    estimatedDeliveryDate?: string;
  }) => {
    const updateData: any = { 
      status: data.status, 
      updated_at: new Date().toISOString() 
    };
    
    if (data.trackingNumber) updateData.tracking_number = data.trackingNumber;
    if (data.shippingCarrier) updateData.shipping_carrier = data.shippingCarrier;
    if (data.estimatedDeliveryDate) updateData.estimated_delivery_date = data.estimatedDeliveryDate;
    
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { 
      message: 'Order status updated successfully', 
      order: updatedOrder 
    };
  },

  // Get analytics data
  getAnalytics: async (storeId: string) => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_price, created_at, order_items(product_id, quantity, products(name))')
      .eq('store_id', storeId);

    if (error) {
      throw new Error(error.message);
    }

    // Calculate analytics
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
    
    return {
      totalOrders,
      uniqueCustomers: 0, // Would need user tracking for this
      totalRevenue,
      conversionRate: 0, // Would need visit tracking for this
      salesOverTime: [],
      bestSellingProducts: [],
    };
  },
};
