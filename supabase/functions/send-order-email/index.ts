
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

    console.log(`Processing email request for order ${orderId}, event: ${eventType}`);

    // Generate email content based on event type
    const emailContent = generateEmailContent(eventType, orderData, orderId);
    
    // Log email attempt
    const { error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        to_email: buyerEmail,
        subject: emailContent.buyerSubject,
        status: 'attempted',
        event_type: eventType,
        order_id: orderId
      });

    if (logError) {
      console.error('Error logging email attempt:', logError);
    }

    // Check if MailerSend API key is available
    const mailersendApiKey = Deno.env.get('MAILERSEND_API_KEY');
    
    if (!mailersendApiKey) {
      console.log('MailerSend API key not configured - email functionality disabled');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Email service not configured' 
      }), {
        status: 200, // Return 200 to not break the order flow
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Send email to buyer
    const emailResult = await sendMailersendEmail({
      to: buyerEmail,
      subject: emailContent.buyerSubject,
      html: emailContent.buyerHtml,
      orderId,
      eventType,
      supabaseClient
    });

    // Send email to seller for certain events (if provided)
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

    return new Response(JSON.stringify({ 
      success: emailResult.success,
      message: emailResult.success ? 'Email sent successfully' : 'Email failed but order processed'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Email service error - order still processed'
      }),
      {
        status: 200, // Return 200 to not break the order flow
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
  
  try {
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailersendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@shopzap.io',
          name: 'ShopZap'
        },
        reply_to: [
          {
            email: 'support@shopzap.io',
            name: 'ShopZap Support'
          }
        ],
        to: [{
          email: to
        }],
        subject: subject,
        html: html
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Email sent successfully:', result);
      
      // Update log as successful
      await supabaseClient
        .from('email_logs')
        .update({
          status: 'sent',
          mailersend_id: result.id,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('event_type', eventType);

      return { success: true, data: result };
    } else {
      console.error('MailerSend API error:', result);
      
      // Update log as failed
      await supabaseClient
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: result.message || 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('event_type', eventType);

      return { success: false, error: result.message || 'Email API error' };
    }
  } catch (error: any) {
    console.error('Email sending error:', error);
    
    // Update log as failed
    await supabaseClient
      .from('email_logs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('event_type', eventType);

    return { success: false, error: error.message };
  }
}

function generateEmailContent(eventType: string, orderData: any, orderId: string) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://shopzap.io';
  const trackingUrl = `${baseUrl}/track-order/${orderId}`;
  const storeUrl = `${baseUrl}/store/${orderData.storeName}`;
  
  const itemsHtml = orderData.items.map((item: any) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 8px; text-align: left;">
        <div style="font-weight: 500; color: #333;">${item.name}</div>
      </td>
      <td style="padding: 12px 8px; text-align: center; color: #666;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; color: #333;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 500; color: #333;">₹${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const baseTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ShopZap Order Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">ShopZap</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${orderData.storeName}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            {{CONTENT}}
            
            <!-- Order Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Order Details</h3>
              <div style="background: #f8f9fa; border-radius: 8px; overflow: hidden; border: 1px solid #e9ecef;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #e9ecef;">
                      <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #495057;">Product</th>
                      <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #495057;">Qty</th>
                      <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Price</th>
                      <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr style="background: #f8f9fa;">
                      <td colspan="3" style="padding: 15px 8px; font-weight: 600; text-align: right; color: #333; border-top: 2px solid #dee2e6;">Order Total:</td>
                      <td style="padding: 15px 8px; font-weight: 600; text-align: right; color: #333; font-size: 18px; border-top: 2px solid #dee2e6;">₹${orderData.totalPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 10px 10px 0;">Track Your Order</a>
              <a href="${storeUrl}" style="display: inline-block; background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 10px 10px 0;">Visit Store</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">Thank you for choosing ShopZap!</p>
            <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Need help? Contact us at <a href="mailto:support@shopzap.io" style="color: #667eea;">support@shopzap.io</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  switch (eventType) {
    case 'order_placed':
      return {
        buyerSubject: `✅ Order Confirmation - ${orderData.storeName} (#${orderId.slice(-8)})`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 22px;">🎉 Thank you for your order, ${orderData.buyerName}!</h2>
            </div>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">We've received your order and it's being processed. You'll receive updates as your order moves through our system.</p>
            ${orderData.estimatedDelivery ? `<p style="color: #333; margin: 15px 0 0 0; font-weight: 500;"><strong>📅 Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>` : ''}
          </div>
        `)
      };
      
    case 'order_confirmed':
      return {
        buyerSubject: `✅ Order Confirmed - ${orderData.storeName} (#${orderId.slice(-8)})`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 22px;">✅ Your order has been confirmed!</h2>
            </div>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">Great news, ${orderData.buyerName}! Your order has been confirmed and is now being prepared for shipment.</p>
          </div>
        `)
      };
      
    case 'order_shipped':
      return {
        buyerSubject: `🚚 Order Shipped - ${orderData.storeName} (#${orderId.slice(-8)})`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #cce5ff; color: #004085; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 22px;">🚚 Your order is on the way!</h2>
            </div>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">Hi ${orderData.buyerName}, your order has been shipped and is on its way to you.</p>
            ${orderData.trackingNumber ? `<p style="color: #333; margin: 15px 0 0 0; font-weight: 500;"><strong>📦 Tracking Number:</strong> ${orderData.trackingNumber}</p>` : ''}
          </div>
        `)
      };
      
    case 'order_delivered':
      return {
        buyerSubject: `✅ Order Delivered - ${orderData.storeName} (#${orderId.slice(-8)})`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 22px;">🎉 Your order has been delivered!</h2>
            </div>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">Hi ${orderData.buyerName}, your order has been successfully delivered. We hope you enjoy your purchase!</p>
            <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">If you have any issues with your order, please don't hesitate to contact the seller.</p>
          </div>
        `)
      };
      
    case 'order_cancelled':
      return {
        buyerSubject: `❌ Order Cancelled - ${orderData.storeName} (#${orderId.slice(-8)})`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 22px;">❌ Your order has been cancelled</h2>
            </div>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">Hi ${orderData.buyerName}, unfortunately your order has been cancelled.</p>
            <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">If you have any questions about this cancellation, please contact the seller directly.</p>
          </div>
        `)
      };
      
    default:
      return {
        buyerSubject: `📦 Order Update - ${orderData.storeName} (#${orderId.slice(-8)})`,
        buyerHtml: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 22px;">📦 Order Update</h2>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">Hi ${orderData.buyerName}, there's been an update to your order.</p>
          </div>
        `)
      };
  }
}

function generateSellerEmailContent(eventType: string, orderData: any, orderId: string) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://shopzap.io';
  const dashboardUrl = `${baseUrl}/dashboard/orders`;
  
  switch (eventType) {
    case 'order_placed':
      return {
        subject: `🛒 New Order Received - ${orderData.buyerName} (#${orderId.slice(-8)})`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Order - ShopZap</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: #28a745; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🛒 New Order Received!</h1>
                </div>
                <div style="padding: 30px 20px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">You have received a new order from <strong>${orderData.buyerName}</strong>.</p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #333;">Order Summary</h3>
                    <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> #${orderId.slice(-8)}</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ₹${orderData.totalPrice.toFixed(2)}</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Items:</strong> ${orderData.items.length} item(s)</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Order Details</a>
                  </div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; color: #6c757d; font-size: 14px;">Manage your orders at ShopZap Dashboard</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
      
    case 'order_cancelled':
      return {
        subject: `❌ Order Cancelled - ${orderData.buyerName} (#${orderId.slice(-8)})`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Cancelled - ShopZap</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: #dc3545; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">❌ Order Cancelled</h1>
                </div>
                <div style="padding: 30px 20px;">
                  <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">The order from <strong>${orderData.buyerName}</strong> has been cancelled.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Orders</a>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      };
      
    default:
      return {
        subject: `📦 Order Update - ${orderData.buyerName} (#${orderId.slice(-8)})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>📦 Order Update</h2>
            <p>There's been an update to the order from <strong>${orderData.buyerName}</strong>.</p>
            <a href="${dashboardUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Orders</a>
          </div>
        `
      };
  }
}

serve(handler);
