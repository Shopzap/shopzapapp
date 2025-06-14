
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

    // Generate secure URLs with proper domain
    const baseUrl = 'https://shopzap.io';
    const orderNumber = orderId.slice(-8);
    const secureToken = btoa(orderId + buyerEmail + Date.now());
    
    // Updated URLs with proper routing
    const trackingUrl = `${baseUrl}/track-order?orderId=${orderId}`;
    const correctionUrl = `${baseUrl}/correct-order?token=${secureToken}`;
    const invoiceUrl = `${baseUrl}/invoice/${orderId}?token=${btoa(orderId + buyerEmail)}`;

    // Create detailed item list with images
    const itemsList = products.map((p: any) => 
      `<div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f1f3f4;">
        <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
          <img src="${p.image || 'https://placehold.co/50x50'}" alt="${p.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
          <div>
            <div style="font-weight: 600; margin-bottom: 5px;">${p.name}</div>
            <div style="color: #666; font-size: 14px;">Qty: ${p.quantity} × ₹${p.price.toLocaleString()}</div>
          </div>
        </div>
        <div style="font-weight: 600; color: #222;">₹${(p.price * p.quantity).toLocaleString()}</div>
      </div>`
    ).join("");

    // Enhanced buyer confirmation email with ShopZap branding
    const buyerHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <!-- Header with ShopZap Logo -->
        <div style="background: linear-gradient(135deg, #7b3fe4 0%, #9b59e6 100%); color: white; padding: 30px 20px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
            </svg>
            <div style="font-size: 28px; font-weight: 700;">ShopZap</div>
          </div>
          <div style="font-size: 16px; opacity: 0.9;">🎉 Your order from ${storeName} is confirmed!</div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #222;">Hi ${buyerName},</div>
          
          <p style="margin-bottom: 20px; color: #666; line-height: 1.6;">
            Thank you for your order from <strong>${storeName}</strong>! We're excited to get your items to you. Here's a summary of your order:
          </p>
          
          <!-- Order Info -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Order ID: <span style="color: #7b3fe4;">#${orderNumber}</span></div>
            <div style="font-size: 16px; color: #7b3fe4; font-weight: 500;">Store: ${storeName}</div>
            <div style="font-size: 14px; color: #666; margin-top: 8px;">Order Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          
          <!-- Order Summary -->
          <div style="font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; color: #222;">Order Summary</div>
          <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
            <div style="background-color: #f8f9fa; padding: 15px 20px; font-weight: 600; border-bottom: 1px solid #e9ecef;">Items Ordered</div>
            ${itemsList}
          </div>
          
          <!-- Total Section -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>₹${totalAmount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Shipping:</span>
              <span style="color: #28a745; font-weight: 600;">Free</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #7b3fe4; border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
              <span>Total Amount:</span>
              <span>₹${totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div style="display: flex; gap: 15px; margin: 30px 0; flex-wrap: wrap;">
            <a href="${invoiceUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7b3fe4; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center; flex: 1; min-width: 140px;">
              🧾 Download Invoice
            </a>
            <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background-color: white; color: #7b3fe4; text-decoration: none; border: 2px solid #7b3fe4; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center; flex: 1; min-width: 140px;">
              📦 Track My Order
            </a>
            <a href="${correctionUrl}" style="display: inline-block; padding: 12px 24px; background-color: white; color: #e67e22; text-decoration: none; border: 2px solid #e67e22; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center; flex: 1; min-width: 140px;">
              ✏️ Correct Order
            </a>
          </div>
          
          <!-- What's Next -->
          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #0066cc; margin-bottom: 10px; font-size: 16px;">📋 What's Next?</h3>
            <p style="color: #666; margin-bottom: 8px; font-size: 14px;">• Order confirmed and being processed by ${storeName}</p>
            <p style="color: #666; margin-bottom: 8px; font-size: 14px;">• We'll send shipping updates via email</p>
            <p style="color: #666; margin-bottom: 8px; font-size: 14px;">• Expected delivery: 3-7 business days</p>
            <p style="color: #666; font-size: 14px;">• Track your order anytime using the link above</p>
          </div>
          
          <!-- Order Correction Notice -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Need to make changes?</strong> You can correct your order details within 24 hours using the "Correct Order" button above.
            </p>
          </div>
          
          <!-- Support Section -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <div style="font-weight: 600; margin-bottom: 10px;">Need Help?</div>
            <div style="color: #666; margin-bottom: 15px; font-size: 14px;">If you have any questions about your order, feel free to contact our support team.</div>
            <a href="mailto:support@shopzap.io" style="color: #7b3fe4; text-decoration: none; font-weight: 500;">support@shopzap.io</a>
          </div>
        </div>
        
        <!-- Footer -->
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

    // Enhanced seller notification email
    const sellerHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7b3fe4 0%, #9b59e6 100%); color: white; padding: 30px 20px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
            </svg>
            <div style="font-size: 28px; font-weight: 700;">ShopZap</div>
          </div>
          <div style="font-size: 16px; opacity: 0.9;">💰 New order for ${storeName}!</div>
          <div style="background-color: #ff6b6b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 15px; display: inline-block;">⚡ Action Required</div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #222;">Hi ${storeName} Team,</div>
          
          <!-- Success Alert -->
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="font-weight: 600; color: #155724; margin-bottom: 10px; font-size: 16px;">🎉 Congratulations! New Order Received</div>
            <div style="color: #155724; font-size: 14px;">A customer just placed an order on your store. Please review the details below and process the order promptly.</div>
          </div>
          
          <!-- Order Details -->
          <div style="font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; color: #222;">Order Details</div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
              <span style="font-weight: 600; color: #666;">Order ID:</span>
              <span style="font-weight: 600; color: #7b3fe4;">#${orderNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
              <span style="font-weight: 600; color: #666;">Order Date:</span>
              <span style="font-weight: 500; color: #222;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
              <span style="font-weight: 600; color: #666;">Payment Status:</span>
              <span style="color: #28a745; font-weight: 600;">✅ Payment Pending (COD)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
              <span style="font-weight: 600; color: #666;">Customer:</span>
              <span style="font-weight: 500; color: #222;">${buyerName}</span>
            </div>
          </div>
          
          <!-- Order Items -->
          <div style="font-size: 18px; font-weight: 600; margin: 25px 0 15px 0; color: #222;">Items to Pack & Ship</div>
          <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
            <div style="background-color: #f8f9fa; padding: 15px 20px; font-weight: 600; border-bottom: 1px solid #e9ecef;">Products Ordered</div>
            ${itemsList}
          </div>
          
          <!-- Total -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>₹${totalAmount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Shipping:</span>
              <span style="color: #28a745;">Free</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #7b3fe4; border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
              <span>Total Amount:</span>
              <span>₹${totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <!-- Next Steps -->
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <div style="font-weight: 600; color: #0c5460; margin-bottom: 15px; font-size: 16px;">📦 Next Steps</div>
            <div style="color: #0c5460; margin-bottom: 12px;">1. ✅ <strong>Confirm the order</strong> in your dashboard</div>
            <div style="color: #0c5460; margin-bottom: 12px;">2. 📦 <strong>Pack the items</strong> securely for shipping</div>
            <div style="color: #0c5460; margin-bottom: 12px;">3. 🚚 <strong>Update tracking information</strong> once shipped</div>
            <div style="color: #0c5460;">4. 💰 <strong>Collect payment</strong> upon delivery (COD)</div>
          </div>
          
          <!-- Support -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <div style="font-weight: 600; margin-bottom: 10px;">Need Help?</div>
            <div style="color: #666; margin-bottom: 15px; font-size: 14px;">If you have any questions about order fulfillment, our support team is here to help.</div>
            <a href="mailto:support@shopzap.io" style="color: #7b3fe4; text-decoration: none; font-weight: 500;">support@shopzap.io</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #222; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <a href="https://shopzap.io/dashboard" style="color: #ccc; text-decoration: none; margin: 0 10px;">Dashboard</a>
            <a href="https://shopzap.io/help" style="color: #ccc; text-decoration: none; margin: 0 10px;">Help Center</a>
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
        from: "ShopZap Orders <orders@shopzap.io>",
        to: [buyerEmail],
        subject: `🎉 Order Confirmed #${orderNumber} - ${storeName}`,
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
          from: "ShopZap Orders <orders@shopzap.io>",
          to: [sellerEmail],
          subject: `💰 New Order #${orderNumber} from ${buyerName} - ${storeName}`,
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
      message: 'Order emails sent successfully',
      orderNumber,
      invoiceUrl,
      trackingUrl,
      correctionUrl
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
