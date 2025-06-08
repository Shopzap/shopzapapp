
import { supabase } from '@/integrations/supabase/client';

interface OrderEmailData {
  buyerName: string;
  storeName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  orderNumber?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export const emailService = {
  async sendOrderEmail(
    orderId: string,
    eventType: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled',
    buyerEmail: string,
    orderData: OrderEmailData,
    sellerEmail?: string
  ) {
    try {
      console.log(`Attempting to send ${eventType} email for order ${orderId}`);
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          orderId,
          eventType,
          buyerEmail,
          sellerEmail,
          orderData
        }
      });

      if (error) {
        console.error('Email service error:', error);
        // Don't throw error for email failures - just log them
        // This prevents email issues from breaking the order flow
        return { success: false, error: error.message };
      }

      console.log('Email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw error for email failures - just log them
      return { success: false, error: error.message };
    }
  },

  async sendOrderPlacedEmail(orderId: string, buyerEmail: string, orderData: OrderEmailData, sellerEmail?: string) {
    return this.sendOrderEmail(orderId, 'order_placed', buyerEmail, orderData, sellerEmail);
  },

  async sendOrderConfirmedEmail(orderId: string, buyerEmail: string, orderData: OrderEmailData) {
    return this.sendOrderEmail(orderId, 'order_confirmed', buyerEmail, orderData);
  },

  async sendOrderShippedEmail(orderId: string, buyerEmail: string, orderData: OrderEmailData) {
    return this.sendOrderEmail(orderId, 'order_shipped', buyerEmail, orderData);
  },

  async sendOrderDeliveredEmail(orderId: string, buyerEmail: string, orderData: OrderEmailData) {
    return this.sendOrderEmail(orderId, 'order_delivered', buyerEmail, orderData);
  },

  async sendOrderCancelledEmail(orderId: string, buyerEmail: string, orderData: OrderEmailData, sellerEmail?: string) {
    return this.sendOrderEmail(orderId, 'order_cancelled', buyerEmail, orderData, sellerEmail);
  }
};
