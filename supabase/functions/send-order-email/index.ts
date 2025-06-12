
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

    const items = products.map((p: any) => `<li>${p.name} × ${p.quantity} = ₹${p.price}</li>`).join("");

    const html = `
      <div style="font-family:sans-serif;padding:1rem;">
        <h2>Hi ${buyerName},</h2>
        <p>Thank you for your order with <strong>${storeName}</strong>!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <ul>${items}</ul>
        <p><strong>Total:</strong> ₹${totalAmount}</p>
        <p>We'll send updates as soon as your order ships.</p>
        <hr />
        <small>If you have any questions, email us at support@shopzap.io</small>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "orders@shopzap.io",
        to: [buyerEmail, sellerEmail],
        subject: `🧾 New Order Placed by ${buyerName}`,
        html,
      }),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ sent: true, status: result }), {
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
