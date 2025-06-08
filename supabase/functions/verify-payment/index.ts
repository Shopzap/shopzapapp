
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderData: {
    storeId: string;
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerAddress?: string;
    totalPrice: number;
    items: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
    }[];
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData }: PaymentVerificationRequest = await req.json();

    console.log(`Verifying payment for Razorpay order ${razorpay_order_id}`);

    // Get Razorpay secret key from environment variables
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY');
    
    if (!razorpaySecret) {
      console.error('Razorpay secret key not configured');
      throw new Error('Payment verification not configured');
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Create HMAC using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(razorpaySecret);
    const messageData = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('Invalid signature for payment:', razorpay_payment_id);
      throw new Error('Payment verification failed');
    }

    console.log('Payment signature verified successfully');

    // Create order in database after successful payment verification
    const { data: newOrder, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        store_id: orderData.storeId,
        buyer_name: orderData.buyerName,
        buyer_email: orderData.buyerEmail,
        buyer_phone: orderData.buyerPhone,
        buyer_address: orderData.buyerAddress,
        total_price: orderData.totalPrice,
        payment_status: 'paid',
        payment_method: 'online',
        payment_gateway: 'razorpay',
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        paid_at: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error(orderError.message);
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: newOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.priceAtPurchase
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order creation
      await supabaseClient.from('orders').delete().eq('id', newOrder.id);
      console.error('Error creating order items:', itemsError);
      throw new Error(itemsError.message);
    }

    console.log('Order created successfully after payment verification:', newOrder.id);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: newOrder.id,
      order: newOrder
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
