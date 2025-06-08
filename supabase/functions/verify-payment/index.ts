
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }: PaymentVerificationRequest = await req.json();

    console.log(`Verifying payment for order ${orderId}`);

    // Get Razorpay secret key
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY');
    
    if (!razorpaySecret) {
      throw new Error('Razorpay secret key not configured');
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = createHmac('sha256', razorpaySecret)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('Invalid signature for payment:', razorpay_payment_id);
      
      // Update order as failed
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid payment signature'
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Update order as paid
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_method: 'online',
        payment_gateway: 'razorpay',
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error(updateError.message);
    }

    console.log('Payment verified and order updated successfully:', updatedOrder);

    // Optionally trigger email notification here
    // await supabaseClient.functions.invoke('send-order-email', {
    //   body: {
    //     orderId,
    //     eventType: 'order_confirmed',
    //     buyerEmail: updatedOrder.buyer_email,
    //     orderData: {
    //       buyerName: updatedOrder.buyer_name,
    //       storeName: 'Your Store',
    //       totalPrice: updatedOrder.total_price,
    //       items: []
    //     }
    //   }
    // });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Payment verified successfully',
      order: updatedOrder
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-payment function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
