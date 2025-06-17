
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  orderId: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  storeName: string;
  sellerEmail?: string;
  paymentMethod?: string;
}

const generateOrderConfirmationHTML = (data: OrderEmailRequest) => {
  const orderNumber = data.orderId.slice(-8);
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${data.storeName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #7b3fe4 0%, #9b59e6 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 30px 20px; }
        .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; color: #222; }
        .order-item { padding: 15px; border-bottom: 1px solid #f1f3f4; display: flex; justify-content: space-between; }
        .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .total-final { font-size: 18px; font-weight: bold; color: #7b3fe4; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 15px; }
        .button { display: inline-block; background: #7b3fe4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { background: #222; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-card { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #7b3fe4; }
        .info-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .info-value { color: #222; font-weight: 500; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ShopZap</div>
            <div>Your order has been confirmed!</div>
        </div>
        
        <div class="content">
            <h2>Hi ${data.buyerName || 'Valued Customer'},</h2>
            
            <p>Thank you for your order! We're excited to get your items to you. Here's a summary of your order:</p>
            
            <div class="order-info">
                <div style="font-weight: 600; margin-bottom: 10px;">Order ID: <span style="color: #7b3fe4;">#${orderNumber}</span></div>
                <div style="color: #7b3fe4; font-weight: 500;">Thank you for shopping with ${data.storeName}</div>
            </div>

            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #0066cc; margin-bottom: 15px;">📋 Order & Delivery Details</h3>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Customer Name</div>
                        <div class="info-value">${data.buyerName || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Contact Email</div>
                        <div class="info-value">${data.buyerEmail || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Phone Number</div>
                        <div class="info-value">${data.buyerPhone || 'Not provided'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Estimated Delivery</div>
                        <div class="info-value">${estimatedDelivery}</div>
                    </div>
                </div>
                ${data.buyerAddress ? `
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; margin-top: 15px;">
                    <div class="info-label">Delivery Address</div>
                    <div class="info-value">${data.buyerAddress}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="section-title">Order Summary</div>
            <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
                <div style="background: #f8f9fa; padding: 15px; font-weight: 600; border-bottom: 1px solid #e9ecef;">
                    Items Ordered
                </div>
                ${data.products.map(item => `
                <div class="order-item">
                    <div>
                        <div style="font-weight: 500; margin-bottom: 5px;">${item.name}</div>
                        <div style="font-size: 14px; color: #666;">Qty: ${item.quantity} × ₹${item.price.toLocaleString()}</div>
                    </div>
                    <div style="font-weight: 600;">₹${(item.price * item.quantity).toLocaleString()}</div>
                </div>
                `).join('')}
            </div>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹${data.totalAmount.toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span style="color: #28a745;">Free</span>
                </div>
                <div class="total-row total-final">
                    <span>Total Amount:</span>
                    <span>₹${data.totalAmount.toLocaleString()}</span>
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #7b3fe4; margin-bottom: 15px;">🏪 Seller Information</h3>
                <div class="info-card">
                    <div class="info-label">Store Name</div>
                    <div class="info-value">${data.storeName}</div>
                </div>
                ${data.sellerEmail ? `
                <div class="info-card" style="margin-top: 10px;">
                    <div class="info-label">Contact Email</div>
                    <div class="info-value">${data.sellerEmail}</div>
                </div>
                ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://shopzap.io/thank-you?order_id=${data.orderId}" class="button">
                    🧾 View Order Details
                </a>
                <a href="https://shopzap.io" class="button" style="background: #666;">
                    🛒 Continue Shopping
                </a>
            </div>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #0066cc; margin-bottom: 10px;">📋 What's Next?</h3>
                <p style="color: #666; margin-bottom: 8px; font-size: 14px;">• Order confirmed and being processed by ${data.storeName}</p>
                <p style="color: #666; margin-bottom: 8px; font-size: 14px;">• We'll send shipping updates via email</p>
                <p style="color: #666; margin-bottom: 8px; font-size: 14px;">• Expected delivery: 3-7 business days</p>
                <p style="color: #666; font-size: 14px;">• Contact the seller if you have any questions</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                <div style="font-weight: 600; margin-bottom: 10px;">Need Help?</div>
                <div style="color: #666; margin-bottom: 15px;">If you have any questions about your order, feel free to contact our support team.</div>
                <a href="mailto:support@shopzap.io" style="color: #7b3fe4; text-decoration: none; font-weight: 500;">support@shopzap.io</a>
            </div>
        </div>
        
        <div class="footer">
            <div>© 2025 ShopZap.io | All rights reserved</div>
        </div>
    </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: OrderEmailRequest = await req.json();
    
    console.log('Sending order confirmation email to:', emailData.buyerEmail);
    console.log('Order data:', emailData);

    const emailResponse = await resend.emails.send({
      from: "ShopZap <orders@shopzap.io>",
      to: [emailData.buyerEmail],
      subject: `Order Confirmation #${emailData.orderId.slice(-8)} - ${emailData.storeName}`,
      html: generateOrderConfirmationHTML(emailData),
    });

    console.log("Email sent successfully:", emailResponse);

    // Also send notification to seller if email provided
    if (emailData.sellerEmail) {
      const sellerEmailResponse = await resend.emails.send({
        from: "ShopZap <orders@shopzap.io>",
        to: [emailData.sellerEmail],
        subject: `New Order Received #${emailData.orderId.slice(-8)} - ₹${emailData.totalAmount.toLocaleString()}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>New Order Alert</h2>
          <p>You have received a new order for your store <strong>${emailData.storeName}</strong>:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> #${emailData.orderId.slice(-8)}</p>
            <p><strong>Customer:</strong> ${emailData.buyerName || 'Not provided'}</p>
            <p><strong>Email:</strong> ${emailData.buyerEmail || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${emailData.buyerPhone || 'Not provided'}</p>
            <p><strong>Address:</strong> ${emailData.buyerAddress || 'Not provided'}</p>
            <p><strong>Total Amount:</strong> ₹${emailData.totalAmount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${emailData.paymentMethod || 'Not specified'}</p>
          </div>
          
          <h3>Items:</h3>
          ${emailData.products.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <strong>${item.name}</strong><br>
              Qty: ${item.quantity} × ₹${item.price.toLocaleString()} = ₹${(item.price * item.quantity).toLocaleString()}
            </div>
          `).join('')}
          
          <p style="margin-top: 20px;">Please process this order as soon as possible.</p>
          
          <div style="background: #222; color: white; padding: 20px; text-align: center; margin-top: 30px;">
            <p>© 2025 ShopZap.io | All rights reserved</p>
          </div>
        </div>
        `,
      });
      
      console.log("Seller notification sent:", sellerEmailResponse);
    }

    return new Response(JSON.stringify(emailResponse), {
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
        error: 'Email sending failed',
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
