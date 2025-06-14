
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    // Verify webhook signature (implement crypto verification here)
    console.log('Razorpay webhook received:', { signature, bodyLength: body.length });

    const event = JSON.parse(body);
    
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.order_id;
      
      if (orderId) {
        // Update order status
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating order:', error);
          throw error;
        }

        // Add to order status history
        await supabase
          .from('order_status_history')
          .insert({
            order_id: orderId,
            status: 'payment_confirmed',
            notes: `Payment confirmed via Razorpay: ${payment.id}`
          });

        console.log('Order payment confirmed:', orderId);
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.order_id;
      
      if (orderId) {
        // Update order status
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        // Add to order status history
        await supabase
          .from('order_status_history')
          .insert({
            order_id: orderId,
            status: 'payment_failed',
            notes: `Payment failed via Razorpay: ${payment.id}`
          });

        console.log('Order payment failed:', orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
