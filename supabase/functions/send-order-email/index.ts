
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderId: string;
  eventType: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
  buyerEmail: string;
  sellerEmail?: string;
  orderData: {
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
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId, eventType, buyerEmail, sellerEmail, orderData }: OrderEmailRequest = await req.json();

    // Generate email content based on event type
    const emailContent = generateEmailContent(eventType, orderData, orderId);
    
    // Send email to buyer
    if (buyerEmail) {
      await sendMailersendEmail({
        to: buyerEmail,
        subject: emailContent.buyerSubject,
        html: emailContent.buyerHtml,
        orderId,
        eventType,
        supabaseClient
      });
    }

    // Send email to seller for certain events
    if (sellerEmail && (eventType === 'order_placed' || eventType === 'order_cancelled')) {
      const sellerContent = generateSellerEmailContent(eventType, orderData, orderId);
      await sendMailersendEmail({
        to: sellerEmail,
        subject: sellerContent.subject,
        html: sellerContent.html,
        orderId,
        eventType: `seller_${eventType}`,
        supabaseClient
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendMailersendEmail({
  to,
  subject,
  html,
  orderId,
  eventType,
  supabaseClient
}: {
  to: string;
  subject: string;
  html: string;
  orderId: string;
  eventType: string;
  supabaseClient: any;
}) {
  const mailersendApiKey = Deno.env.get('MAILERSEND_API_KEY');
  
  if (!mailersendApiKey) {
    throw new Error('MAILERSEND_API_KEY not configured');
  }

  // Log email attempt
  const { data: logData, error: logError } = await supabaseClient
    .from('email_logs')
    .insert({
      to_email: to,
      subject: subject,
      status: 'sending',
      event_type: eventType,
      order_id: orderId
    })
    .select()
    .single();

  if (logError) {
    console.error('Error logging email:', logError);
  }

  try {
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailersendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: 'orders@shopzap.io',
          name: 'ShopZap Orders'
        },
        to: [{
          email: to
        }],
        subject: subject,
        html: html
      })
    });

    const result = await response.json();

    if (response.ok) {
      // Update log as successful
      if (logData) {
        await supabaseClient
          .from('email_logs')
          .update({
            status: 'sent',
            mailersend_id: result.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', logData.id);
      }
    } else {
      throw new Error(result.message || 'Failed to send email');
    }
  } catch (error: any) {
    // Update log as failed
    if (logData) {
      await supabaseClient
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', logData.id);
    }
    throw error;
  }
}

function generateEmailContent(eventType: string, orderData: any, orderId: string) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://shopzap.io';
  const trackingUrl = `${baseUrl}/track/${orderId}`;
  
  const itemsHtml = orderData.items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const baseTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #333; margin: 0;">ShopZap</h1>
        <h2 style="color: #666; margin: 10px 0 0 0;">${orderData.storeName}</h2>
      </div>
      
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        {{CONTENT}}
        
        <h3 style="color: #333; margin-top: 30px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px 8px; font-weight: bold; text-align: right; border-top: 2px solid #ddd;">Total:</td>
              <td style="padding: 12px 8px; font-weight: bold; text-align: right; border-top: 2px solid #ddd;">₹${orderData.totalPrice.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
          <p style="margin: 0;"><strong>Track your order:</strong></p>
          <a href="${trackingUrl}" style="color: #007bff; text-decoration: none;">${trackingUrl}</a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Thank you for choosing ShopZap!</p>
      </div>
    </div>
  `;

  switch (eventType) {
    case 'order_placed':
      return {
        buyerSubject: `Order Confirmation - ${orderData.storeName}`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <h3 style="color: #28a745;">Thank you for your order, ${orderData.buyerName}!</h3>
          <p>We've received your order and it's being processed. You'll receive updates as your order moves through our system.</p>
          ${orderData.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>` : ''}
        `)
      };
      
    case 'order_confirmed':
      return {
        buyerSubject: `Order Confirmed - ${orderData.storeName}`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <h3 style="color: #28a745;">Your order has been confirmed!</h3>
          <p>Great news, ${orderData.buyerName}! Your order has been confirmed and is now being prepared for shipment.</p>
        `)
      };
      
    case 'order_shipped':
      return {
        buyerSubject: `Order Shipped - ${orderData.storeName}`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <h3 style="color: #17a2b8;">Your order is on the way!</h3>
          <p>Hi ${orderData.buyerName}, your order has been shipped and is on its way to you.</p>
          ${orderData.trackingNumber ? `<p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>` : ''}
        `)
      };
      
    case 'order_delivered':
      return {
        buyerSubject: `Order Delivered - ${orderData.storeName}`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <h3 style="color: #28a745;">Your order has been delivered!</h3>
          <p>Hi ${orderData.buyerName}, your order has been successfully delivered. We hope you enjoy your purchase!</p>
          <p>If you have any issues with your order, please don't hesitate to contact the seller.</p>
        `)
      };
      
    case 'order_cancelled':
      return {
        buyerSubject: `Order Cancelled - ${orderData.storeName}`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <h3 style="color: #dc3545;">Your order has been cancelled</h3>
          <p>Hi ${orderData.buyerName}, unfortunately your order has been cancelled.</p>
          <p>If you have any questions about this cancellation, please contact the seller directly.</p>
        `)
      };
      
    default:
      return {
        buyerSubject: `Order Update - ${orderData.storeName}`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <h3>Order Update</h3>
          <p>Hi ${orderData.buyerName}, there's been an update to your order.</p>
        `)
      };
  }
}

function generateSellerEmailContent(eventType: string, orderData: any, orderId: string) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://shopzap.io';
  const dashboardUrl = `${baseUrl}/orders`;
  
  switch (eventType) {
    case 'order_placed':
      return {
        subject: `New Order Received - ${orderData.buyerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28a745;">New Order Received!</h2>
            <p>You have received a new order from <strong>${orderData.buyerName}</strong>.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3>Order Summary</h3>
              <p><strong>Total:</strong> ₹${orderData.totalPrice.toFixed(2)}</p>
              <p><strong>Items:</strong> ${orderData.items.length}</p>
            </div>
            
            <a href="${dashboardUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Order Details</a>
          </div>
        `
      };
      
    case 'order_cancelled':
      return {
        subject: `Order Cancelled - ${orderData.buyerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc3545;">Order Cancelled</h2>
            <p>The order from <strong>${orderData.buyerName}</strong> has been cancelled.</p>
            
            <a href="${dashboardUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Orders</a>
          </div>
        `
      };
      
    default:
      return {
        subject: `Order Update - ${orderData.buyerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Order Update</h2>
            <p>There's been an update to the order from <strong>${orderData.buyerName}</strong>.</p>
          </div>
        `
      };
  }
}

serve(handler);
