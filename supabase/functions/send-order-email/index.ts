
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buyerEmail, buyerName, orderId, products, totalAmount, storeName, sellerEmail } = await req.json();
    
    console.log('Sending order emails for:', { orderId, buyerEmail, sellerEmail, storeName });

    // Create detailed item list
    const itemsList = products.map((p: any) => 
      `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #f1f3f4;">
        <div>
          <strong>${p.name}</strong><br>
          <span style="color: #666; font-size: 14px;">Qty: ${p.quantity} × ₹${p.price}</span>
        </div>
        <div style="font-weight: 600;">₹${p.price * p.quantity}</div>
      </div>`
    ).join("");

    // Buyer confirmation email
    const buyerHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #7b3fe4 0%, #9b59e6 100%); color: white; padding: 30px 20px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; margin-bottom: 10px;">ShopZap</div>
          <div style="font-size: 16px; opacity: 0.9;">Your order has been confirmed!</div>
        </div>
        
        <div style="padding: 30px 20px;">
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #222;">Hi ${buyerName},</div>
          
          <p style="margin-bottom: 20px; color: #666;">
            Thank you for your order! We're excited to get your items to you. Here's a summary of your order:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Order ID: <span style="color: #7b3fe4;">#${orderId}</span></div>
            <div style="font-size: 16px; color: #7b3fe4; font-weight: 500;">Thank you for shopping with ${storeName}</div>
          </div>
          
          <div style="font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; color: #222;">Order Summary</div>
          <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
            <div style="background-color: #f8f9fa; padding: 15px 20px; font-weight: 600; border-bottom: 1px solid #e9ecef;">Items Ordered</div>
            ${itemsList}
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>₹${totalAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Shipping:</span>
              <span style="color: #28a745;">Free</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #7b3fe4; border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
              <span>Total Amount:</span>
              <span>₹${totalAmount}</span>
            </div>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #0066cc; margin-bottom: 10px;">What's Next?</h3>
            <p style="color: #666; margin-bottom: 10px;">• We'll send you shipping updates via email</p>
            <p style="color: #666; margin-bottom: 10px;">• Expected delivery: 3-7 business days</p>
            <p style="color: #666;">• You can contact us anytime for updates</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <div style="font-weight: 600; margin-bottom: 10px;">Need Help?</div>
            <div style="color: #666; margin-bottom: 15px;">If you have any questions about your order, feel free to contact our support team.</div>
            <a href="mailto:support@shopzap.io" style="color: #7b3fe4; text-decoration: none; font-weight: 500;">support@shopzap.io</a>
          </div>
        </div>
        
        <div style="background-color: #222; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <a href="https://shopzap.io/help" style="color: #ccc; text-decoration: none; margin: 0 10px;">Help Center</a>
            <a href="https://shopzap.io/privacy" style="color: #ccc; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
            <a href="https://shopzap.io/terms" style="color: #ccc; text-decoration: none; margin: 0 10px;">Terms of Service</a>
          </div>
          <div>© 2025 ShopZap.io | All rights reserved</div>
        </div>
      </div>
    `;

    // Seller notification email (same design, different messaging)
    const sellerHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #7b3fe4 0%, #9b59e6 100%); color: white; padding: 30px 20px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; margin-bottom: 10px;">ShopZap</div>
          <div style="font-size: 16px; opacity: 0.9;">New order received!</div>
          <div style="background-color: #ff6b6b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 15px; display: inline-block;">⚡ Action Required</div>
        </div>
        
        <div style="padding: 30px 20px;">
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #222;">Hi ${storeName} Team,</div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="font-weight: 600; color: #856404; margin-bottom: 10px; font-size: 16px;">🎉 Congratulations! You have a new order</div>
            <div style="color: #856404; font-size: 14px;">A customer just placed an order on your store. Please review the details below and process the order promptly.</div>
          </div>
          
          <div style="font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; color: #222;">Order Details</div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
              <span style="font-weight: 600; color: #666;">Order ID:</span>
              <span style="font-weight: 500; color: #7b3fe4; font-weight: 600;">#${orderId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
              <span style="font-weight: 600; color: #666;">Payment Status:</span>
              <span style="font-weight: 500; color: #28a745; font-weight: 600;">✅ Paid</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0; padding-bottom: 0; border-bottom: none;">
              <span style="font-weight: 600; color: #666;">Customer:</span>
              <span style="font-weight: 500; color: #222;">${buyerName}</span>
            </div>
          </div>
          
          <div style="font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; color: #222;">Order Summary</div>
          <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
            <div style="background-color: #f8f9fa; padding: 15px 20px; font-weight: 600; border-bottom: 1px solid #e9ecef;">Items to Pack & Ship</div>
            ${itemsList}
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>₹${totalAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Shipping:</span>
              <span style="color: #28a745;">Free</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #7b3fe4; border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
              <span>Total Amount:</span>
              <span>₹${totalAmount}</span>
            </div>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <div style="font-weight: 600; color: #0c5460; margin-bottom: 10px;">📦 Next Steps</div>
            <div style="color: #0c5460;">
              Please pack and fulfill this order promptly. Your customer is excited to receive their items! Make sure to update the order status and tracking information in your dashboard.
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #7b3fe4; margin-bottom: 15px;">💡 Pro Tips for Order Fulfillment</h3>
            <div style="color: #666; margin-bottom: 10px;">• Pack items securely to prevent damage during shipping</div>
            <div style="color: #666; margin-bottom: 10px;">• Update tracking information as soon as you ship</div>
            <div style="color: #666; margin-bottom: 10px;">• Include a thank you note for better customer experience</div>
            <div style="color: #666;">• Process orders within 24 hours for best customer satisfaction</div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <div style="font-weight: 600; margin-bottom: 10px;">Need Help?</div>
            <div style="color: #666; margin-bottom: 15px;">If you have any questions about order fulfillment or need assistance, our support team is here to help.</div>
            <a href="mailto:support@shopzap.io" style="color: #7b3fe4; text-decoration: none; font-weight: 500;">support@shopzap.io</a>
          </div>
        </div>
        
        <div style="background-color: #222; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <a href="https://shopzap.io/help" style="color: #ccc; text-decoration: none; margin: 0 10px;">Help Center</a>
            <a href="https://shopzap.io/dashboard" style="color: #ccc; text-decoration: none; margin: 0 10px;">Dashboard</a>
            <a href="https://shopzap.io/tutorials" style="color: #ccc; text-decoration: none; margin: 0 10px;">Tutorials</a>
          </div>
          <div>© 2025 ShopZap.io | All rights reserved</div>
        </div>
      </div>
    `;

    // Send buyer email
    const buyerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "orders@shopzap.io",
        to: [buyerEmail],
        subject: `🎉 Order Confirmed - ${storeName} | Order #${orderId.slice(-8)}`,
        html: buyerHtml,
      }),
    });

    const buyerResult = await buyerResponse.json();
    console.log('Buyer email result:', buyerResult);

    // Send seller email if seller email is provided
    let sellerResult = null;
    if (sellerEmail && sellerEmail !== buyerEmail) {
      const sellerResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "orders@shopzap.io",
          to: [sellerEmail],
          subject: `🧾 New Order Received from ${buyerName} | Order #${orderId.slice(-8)}`,
          html: sellerHtml,
        }),
      });

      sellerResult = await sellerResponse.json();
      console.log('Seller email result:', sellerResult);
    }

    return new Response(JSON.stringify({ 
      sent: true, 
      buyerStatus: buyerResult,
      sellerStatus: sellerResult,
      message: 'Order emails sent successfully'
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ sent: false, error: error.message }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }
});
