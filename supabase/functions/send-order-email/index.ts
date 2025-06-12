
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
    buyerPhone?: string;
    buyerAddress?: string;
    orderDate?: string;
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

    // Log email attempt for buyer
    const { error: buyerLogError } = await supabaseClient
      .from('email_logs')
      .insert({
        to_email: buyerEmail,
        subject: `Order ${eventType.replace('_', ' ')} - ${orderData.storeName}`,
        status: 'attempted',
        event_type: eventType,
        order_id: orderId
      });

    if (buyerLogError) {
      console.error('Error logging buyer email attempt:', buyerLogError);
    }

    // Check if Resend API key is available
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('Resend API key not configured - email functionality disabled');
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

    // Generate email content based on event type
    const buyerEmailContent = generateBuyerEmailContent(eventType, orderData, orderId);
    
    // Send email to buyer
    const buyerEmailResult = await sendResendEmail({
      to: buyerEmail,
      subject: buyerEmailContent.subject,
      html: buyerEmailContent.html,
      orderId,
      eventType,
      recipient: 'buyer',
      supabaseClient
    });

    // Send email to seller for order_placed event
    let sellerEmailResult = { success: true };
    if (sellerEmail && eventType === 'order_placed') {
      // Log email attempt for seller
      const { error: sellerLogError } = await supabaseClient
        .from('email_logs')
        .insert({
          to_email: sellerEmail,
          subject: `New Order Received: ${orderId.slice(-8)} from ${orderData.buyerName}`,
          status: 'attempted',
          event_type: 'seller_order_received',
          order_id: orderId
        });

      if (sellerLogError) {
        console.error('Error logging seller email attempt:', sellerLogError);
      }

      const sellerContent = generateSellerEmailContent(orderData, orderId);
      sellerEmailResult = await sendResendEmail({
        to: sellerEmail,
        subject: sellerContent.subject,
        html: sellerContent.html,
        orderId,
        eventType: 'seller_order_received',
        recipient: 'seller',
        supabaseClient
      });
    }

    return new Response(JSON.stringify({ 
      success: buyerEmailResult.success && sellerEmailResult.success,
      buyerEmail: buyerEmailResult,
      sellerEmail: sellerEmailResult,
      message: 'Email processing completed'
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

async function sendResendEmail({
  to,
  subject,
  html,
  orderId,
  eventType,
  recipient,
  supabaseClient
}: {
  to: string;
  subject: string;
  html: string;
  orderId: string;
  eventType: string;
  recipient: 'buyer' | 'seller';
  supabaseClient: any;
}) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'orders@shopzap.io',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`${recipient} email sent successfully via Resend:`, result);
      
      // Update log as successful
      await supabaseClient
        .from('email_logs')
        .update({
          status: 'sent',
          mailersend_id: result.id,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('to_email', to)
        .eq('event_type', eventType);

      return { success: true, data: result };
    } else {
      console.error(`${recipient} Resend API error:`, result);
      
      // Update log as failed
      await supabaseClient
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: result.message || 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('to_email', to)
        .eq('event_type', eventType);

      return { success: false, error: result.message || 'Email API error' };
    }
  } catch (error: any) {
    console.error(`${recipient} email sending error:`, error);
    
    // Update log as failed
    await supabaseClient
      .from('email_logs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('to_email', to)
      .eq('event_type', eventType);

    return { success: false, error: error.message };
  }
}

function generateBuyerEmailContent(eventType: string, orderData: any, orderId: string) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://shopzap.io';
  const trackingUrl = `${baseUrl}/track?order=${orderId}`;
  const correctionUrl = `${baseUrl}/fix-order/${orderId}`;
  const invoiceUrl = `${baseUrl}/invoice/${orderId}`;
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

  const orderDate = orderData.orderDate || new Date().toLocaleDateString('en-IN');

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
              <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📦 Order Details</h3>
              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${orderDate}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ₹${orderData.totalPrice.toFixed(2)}</p>
              </div>
              
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
              <a href="${trackingUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 10px 10px 0;">🔗 Track Your Order</a>
              <a href="${invoiceUrl}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 0 10px 10px 0;">🧾 Download Invoice</a>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${correctionUrl}" style="display: inline-block; background: #ffc107; color: #212529; padding: 10px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">🔁 Need to fix address? Click here (within 24 hours)</a>
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
        subject: `Thank you ${orderData.buyerName}, your order at ${orderData.storeName} is confirmed! 🛒`,
        html: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 22px;">Hi ${orderData.buyerName},</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for shopping with ${orderData.storeName} on ShopZap! 🎉</p>
            </div>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">We've received your order and it's being processed. You'll receive updates as your order moves through our system.</p>
            <p style="color: #333; margin: 15px 0 0 0; font-weight: 500;">We'll notify you once your order is out for delivery. Thank you again!</p>
          </div>
        `)
      };
      
    default:
      return {
        subject: `📦 Order Update - ${orderData.storeName} (#${orderId.slice(-8)})`,
        html: baseTemplate.replace('{{CONTENT}}', `
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 22px;">📦 Order Update</h2>
            <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">Hi ${orderData.buyerName}, there's been an update to your order.</p>
          </div>
        `)
      };
  }
}

function generateSellerEmailContent(orderData: any, orderId: string) {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://shopzap.io';
  const dashboardUrl = `${baseUrl}/dashboard/orders/${orderId}`;
  
  const itemsHtml = orderData.items.map((item: any) => 
    `<li style="margin: 5px 0;">${item.name} - ₹${item.price} × ${item.quantity}</li>`
  ).join('');

  return {
    subject: `🎉 New Order Received: ${orderId.slice(-8)} from ${orderData.buyerName}`,
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
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Order Received!</h1>
            </div>
            <div style="padding: 30px 20px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${orderData.storeName},</p>
              <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">You have received a new order via ShopZap:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">🧾 Order Details</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="margin: 5px 0; color: #666;"><strong>👤 Buyer:</strong> ${orderData.buyerName}</p>
                ${orderData.buyerPhone ? `<p style="margin: 5px 0; color: #666;"><strong>📞 Phone:</strong> ${orderData.buyerPhone}</p>` : ''}
                ${orderData.buyerAddress ? `<p style="margin: 5px 0; color: #666;"><strong>📍 Address:</strong> ${orderData.buyerAddress}</p>` : ''}
                <p style="margin: 5px 0; color: #666;"><strong>💰 Total Amount:</strong> ₹${orderData.totalPrice.toFixed(2)}</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">🛍️ Products:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                  ${itemsHtml}
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">📦 View Order in Dashboard</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">Make sure to confirm or process the order within your SLA.</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Best regards,<br>Team ShopZap</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

serve(handler);
