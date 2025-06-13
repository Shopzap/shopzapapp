
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
  isTestMode?: boolean;
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestMode = true, orderData }: PaymentVerificationRequest = await req.json();

    console.log(`[${isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Verifying payment for ShopZap Razorpay order ${razorpay_order_id}`);

    // Get ShopZap.io Razorpay secret key from environment variables and TRIM whitespace
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY')?.trim();
    
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Secret available: ${razorpaySecret ? 'YES' : 'NO'}`);
    
    if (!razorpaySecret) {
      console.error('ShopZap.io Razorpay secret key not configured');
      throw new Error('Payment verification not configured with ShopZap.io credentials');
    }

    // Verify signature using ShopZap secret
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
      console.error(`[${isTestMode ? 'TEST' : 'LIVE'}] Invalid signature for ShopZap payment:`, razorpay_payment_id);
      throw new Error('Payment verification failed with ShopZap.io credentials');
    }

    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Payment signature verified successfully with ShopZap credentials`);

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
        status: 'pending',
        // Add test mode flag to order notes with ShopZap info
        notes: isTestMode ? 'TEST MODE PAYMENT - ShopZap.io Razorpay Account - This is a test transaction' : 'LIVE PAYMENT - ShopZap.io Razorpay Account'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order with ShopZap payment:', orderError);
      throw new Error(orderError.message);
    }

    console.log('Order created successfully:', newOrder);

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
      console.error('Error creating order items for ShopZap payment:', itemsError);
      throw new Error(itemsError.message);
    }

    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Order created successfully after ShopZap payment verification:`, newOrder.id);

    // Get store information for email
    const { data: storeData } = await supabaseClient
      .from('stores')
      .select('name, business_email, user_id')
      .eq('id', orderData.storeId)
      .single();

    // Get product information for email
    const { data: productData } = await supabaseClient
      .from('products')
      .select('id, name, price')
      .in('id', orderData.items.map(item => item.productId));

    // Prepare email data
    if (orderData.buyerEmail && storeData) {
      console.log('Sending order confirmation emails...');
      
      const emailProducts = orderData.items.map(item => {
        const product = productData?.find(p => p.id === item.productId);
        return {
          name: product?.name || 'Product',
          quantity: item.quantity,
          price: item.priceAtPurchase
        };
      });

      try {
        // Send order confirmation email to both buyer and seller
        const { data: emailData, error: emailError } = await supabaseClient.functions.invoke('send-order-email', {
          body: {
            buyerEmail: orderData.buyerEmail,
            buyerName: orderData.buyerName,
            orderId: newOrder.id,
            products: emailProducts,
            totalAmount: orderData.totalPrice,
            storeName: storeData.name,
            sellerEmail: storeData.business_email
          }
        });

        if (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
          // Don't fail the order creation due to email issues
        } else {
          console.log('Order confirmation emails sent successfully:', emailData);
        }
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the order creation due to email issues
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Payment verified and order created successfully with ShopZap.io account${isTestMode ? ' (TEST MODE)' : ''}`,
      orderId: newOrder.id,
      order: newOrder,
      testMode: isTestMode,
      testMessage: isTestMode ? 'This was a test payment using ShopZap.io Razorpay test environment' : undefined,
      platform: 'ShopZap.io',
      // Add redirect information
      redirectUrl: `/thank-you?order_id=${newOrder.id}&payment_id=${razorpay_payment_id}`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in ShopZap verify-payment function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        testMode: true, // Default to test mode for errors
        platform: 'ShopZap.io'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
