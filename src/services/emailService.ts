
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
      console.log(`Attempting to send ${eventType} email for order ${orderId} via Resend`);
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          buyerEmail,
          buyerName: orderData.buyerName,
          orderId,
          products: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: orderData.totalPrice,
          storeName: orderData.storeName,
          sellerEmail
        }
      });

      if (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
      }

      console.log('Email sent successfully via Resend:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
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
