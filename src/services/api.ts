import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { paymentConfig } from '@/config/payment';

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
    
    // Prepare theme object - ensure we have an object to spread
    const currentTheme = (storeData.theme && typeof storeData.theme === 'object') ? storeData.theme : {};
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
    
    // Prepare theme object with social links - ensure we have an object to spread
    const currentTheme = (storeData.theme && typeof storeData.theme === 'object') ? storeData.theme : {};
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

// Orders API - Updated to use Supabase directly with test mode support
export const ordersApi = {
  // Create a new order with payment support and test mode handling
  createOrder: async (orderData: {
    storeId: string;
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerAddress?: string;
    totalPrice: number;
    paymentMethod?: string;
    paymentStatus?: string;
    items: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
    }[];
  }) => {
    // Add test mode flag to order notes if in test mode
    const orderNotes = paymentConfig.isTestMode ? 'TEST MODE ORDER - This is a test transaction' : null;
    
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
        payment_method: orderData.paymentMethod || 'cod',
        payment_status: orderData.paymentStatus || 'pending',
        status: 'pending',
        notes: orderNotes
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
      message: `Order created successfully${paymentConfig.isTestMode ? ' (TEST MODE)' : ''}`, 
      orderId: orderInsertData.id,
      order: orderInsertData,
      testMode: paymentConfig.isTestMode
    };
  },

  // Create Razorpay order with test mode support
  createRazorpayOrder: async (orderData: {
    amount: number;
    currency?: string;
    receipt: string;
  }) => {
    console.log(`[${paymentConfig.isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Creating Razorpay order:`, orderData);
    
    const response = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        isTestMode: paymentConfig.isTestMode
      }
    });

    if (response.error) {
      console.error('Razorpay order creation failed:', response.error);
      throw new Error(response.error.message || 'Failed to create payment order');
    }

    console.log(`[${paymentConfig.isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Razorpay order created:`, response.data);
    return response.data;
  },

  // Verify Razorpay payment with test mode support
  verifyRazorpayPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderData: {
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
    };
  }) => {
    console.log(`[${paymentConfig.isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Verifying payment:`, {
      orderId: paymentData.razorpay_order_id,
      paymentId: paymentData.razorpay_payment_id
    });
    
    const response = await supabase.functions.invoke('verify-payment', {
      body: {
        ...paymentData,
        isTestMode: paymentConfig.isTestMode
      }
    });

    if (response.error) {
      console.error('Payment verification failed:', response.error);
      throw new Error(response.error.message || 'Payment verification failed');
    }

    console.log(`[${paymentConfig.isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Payment verified:`, response.data);
    return response.data;
  },

  // Update order with payment information
  updateOrderPayment: async (orderId: string, paymentData: {
    paymentStatus: string;
    paymentMethod?: string;
    paymentGateway?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  }) => {
    const updateData: any = { 
      payment_status: paymentData.paymentStatus,
      updated_at: new Date().toISOString()
    };
    
    if (paymentData.paymentMethod) updateData.payment_method = paymentData.paymentMethod;
    if (paymentData.paymentGateway) updateData.payment_gateway = paymentData.paymentGateway;
    if (paymentData.razorpayPaymentId) updateData.razorpay_payment_id = paymentData.razorpayPaymentId;
    if (paymentData.razorpayOrderId) updateData.razorpay_order_id = paymentData.razorpayOrderId;
    if (paymentData.razorpaySignature) updateData.razorpay_signature = paymentData.razorpaySignature;
    
    if (paymentData.paymentStatus === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }
    
    // Add test mode information to notes if applicable
    if (paymentConfig.isTestMode) {
      updateData.notes = 'TEST MODE PAYMENT - This is a test transaction';
    }
    
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
      message: `Payment updated successfully${paymentConfig.isTestMode ? ' (TEST MODE)' : ''}`, 
      order: updatedOrder,
      testMode: paymentConfig.isTestMode
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
    
    // Preserve test mode information in notes
    let notes = data.notes || '';
    if (paymentConfig.isTestMode && !notes.includes('TEST MODE')) {
      notes = notes ? `${notes} (TEST MODE)` : 'TEST MODE ORDER';
    }
    if (notes) updateData.notes = notes;
    
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
      message: `Order status updated successfully${paymentConfig.isTestMode ? ' (TEST MODE)' : ''}`, 
      order: updatedOrder,
      testMode: paymentConfig.isTestMode
    };
  },

  // Get analytics data with test mode awareness
  getAnalytics: async (storeId: string) => {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_price, payment_status, created_at, notes, order_items(product_id, quantity, products(name))')
      .eq('store_id', storeId);

    if (error) {
      throw new Error(error.message);
    }

    // Calculate analytics
    const totalOrders = orders?.length || 0;
    const paidOrders = orders?.filter(order => order.payment_status === 'paid') || [];
    const testOrders = orders?.filter(order => order.notes?.includes('TEST MODE')) || [];
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
    
    return {
      totalOrders,
      paidOrders: paidOrders.length,
      testOrders: testOrders.length,
      uniqueCustomers: 0, // Would need user tracking for this
      totalRevenue,
      conversionRate: 0, // Would need visit tracking for this
      salesOverTime: [],
      bestSellingProducts: [],
      testMode: paymentConfig.isTestMode,
      testModeWarning: paymentConfig.isTestMode ? 'Analytics include test mode transactions' : null
    };
  },
};
