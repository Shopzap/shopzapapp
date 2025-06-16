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
    paymentMethod?: string;
    items: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
      name: string;
      image: string;
    }[];
  };
}

const sendConfirmationEmail = async (supabaseClient: any, orderId: string, orderData: PaymentVerificationRequest['orderData']) => {
  try {
    const { data: storeDetails, error: storeError } = await supabaseClient
      .from('stores')
      .select('name, business_email')
      .eq('id', orderData.storeId)
      .single();

    if (storeError) throw storeError;

    const emailPayload = {
      buyerEmail: orderData.buyerEmail,
      buyerName: orderData.buyerName,
      orderId: orderId,
      products: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.priceAtPurchase,
        image: item.image,
      })),
      totalAmount: orderData.totalPrice,
      storeName: storeDetails.name,
      sellerEmail: storeDetails.business_email
    };

    // Invoke email function without failing the main transaction
    const { error: emailError } = await supabaseClient.functions.invoke('send-order-email', {
      body: emailPayload
    });

    if (emailError) {
      console.error(`Failed to send order confirmation email for order ${orderId}:`, emailError);
    } else {
      console.log(`Successfully queued confirmation email for order ${orderId}`);
    }

  } catch (emailStepError) {
    console.error(`Error during email notification step for order ${orderId}:`, emailStepError.message);
    // Do not re-throw, to avoid failing the entire order process
  }
};

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

    console.log(`Processing order for payment method: ${orderData.paymentMethod || 'online'}`);

    // If this is a COD order (no payment IDs provided)
    if (!razorpay_order_id && !razorpay_payment_id && !razorpay_signature) {
      console.log('Processing COD order...');
      
      // Create COD order directly
      const { data: newOrder, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          store_id: orderData.storeId,
          buyer_name: orderData.buyerName,
          buyer_email: orderData.buyerEmail,
          buyer_phone: orderData.buyerPhone,
          buyer_address: orderData.buyerAddress,
          total_price: orderData.totalPrice,
          payment_status: 'pending',
          payment_method: 'cod', // Explicitly set COD
          status: 'pending',
          notes: 'Cash on Delivery Order'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating COD order:', orderError);
        throw new Error(`COD order creation failed: ${orderError.message}`);
      }

      // Create order items with proper UUID handling
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => {
          // Generate a proper UUID for the product if it doesn't exist
          let productId = item.productId;
          
          // If productId has a "product-" prefix, remove it and use the UUID part
          if (productId.startsWith('product-')) {
            productId = productId.replace('product-', '');
          }
          
          // If it's not a valid UUID format, generate a random one
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(productId)) {
            productId = crypto.randomUUID();
            console.log(`Generated new UUID for product: ${productId}`);
          }
          
          return {
            order_id: newOrder.id,
            product_id: productId,
            quantity: item.quantity,
            price_at_purchase: item.priceAtPurchase
          };
        });

        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          // Rollback order creation
          await supabaseClient.from('orders').delete().eq('id', newOrder.id);
          console.error('Error creating order items for COD order:', itemsError);
          throw new Error(`COD order items creation failed: ${itemsError.message}`);
        }
      }

      console.log('COD order created successfully:', newOrder.id);
      
      // Send confirmation email (fire and forget)
      sendConfirmationEmail(supabaseClient, newOrder.id, orderData);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'COD order created successfully',
        orderId: newOrder.id,
        order: newOrder
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Online payment verification
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY')?.trim();
    
    if (!razorpaySecret) {
      console.error('Razorpay secret key not configured');
      throw new Error('Payment verification not configured - missing secret key');
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Missing required payment parameters:', {
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature
      });
      throw new Error('Missing required payment verification parameters');
    }

    console.log(`Verifying payment for order ${razorpay_order_id}, payment ${razorpay_payment_id}`);

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    try {
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

      console.log('Signature verification - Expected vs Received:', {
        expected: expectedSignature.substring(0, 20) + '...',
        received: razorpay_signature.substring(0, 20) + '...',
        match: expectedSignature === razorpay_signature
      });

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        console.error('Payment signature verification failed');
        throw new Error('Payment verification failed - Invalid signature. This may indicate a security issue.');
      }

      console.log('Payment signature verified successfully');
    } catch (cryptoError) {
      console.error('Crypto signature verification error:', cryptoError);
      throw new Error(`Payment signature verification failed: ${cryptoError.message}`);
    }

    // Create order in database after successful payment verification
    try {
      const { data: newOrder, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          store_id: orderData.storeId,
          buyer_name: orderData.buyerName,
          buyer_email: orderData.buyerEmail,
          buyer_phone: orderData.buyerPhone,
          buyer_address: orderData.buyerAddress,
          total_price: orderData.totalPrice,
          payment_status: 'paid', // Mark as paid for successful online payment
          payment_method: 'online', // Explicitly set online payment
          payment_gateway: 'razorpay',
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          paid_at: new Date().toISOString(),
          status: 'pending',
          notes: 'Online Payment - Razorpay'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error(`Order creation failed: ${orderError.message}`);
      }

      // Create order items with proper UUID handling
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => {
          // Generate a proper UUID for the product if it doesn't exist
          let productId = item.productId;
          
          // If productId has a "product-" prefix, remove it and use the UUID part
          if (productId.startsWith('product-')) {
            productId = productId.replace('product-', '');
          }
          
          // If it's not a valid UUID format, generate a random one
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(productId)) {
            productId = crypto.randomUUID();
            console.log(`Generated new UUID for product: ${productId}`);
          }
          
          return {
            order_id: newOrder.id,
            product_id: productId,
            quantity: item.quantity,
            price_at_purchase: item.priceAtPurchase
          };
        });

        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          // Rollback order creation
          await supabaseClient.from('orders').delete().eq('id', newOrder.id);
          console.error('Error creating order items:', itemsError);
          throw new Error(`Order items creation failed: ${itemsError.message}`);
        }
      }

      console.log('Order created successfully:', newOrder.id);
      
      // Send confirmation email (fire and forget)
      sendConfirmationEmail(supabaseClient, newOrder.id, orderData);

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
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw new Error(`Database operation failed: ${dbError.message}`);
    }

  } catch (error: any) {
    console.error("Error in verify-payment function:", error);
    
    // Provide more specific error messages
    let errorMessage = 'Payment verification failed';
    if (error.message.includes('signature')) {
      errorMessage = 'Payment signature verification failed. Please try again or contact support.';
    } else if (error.message.includes('database') || error.message.includes('order')) {
      errorMessage = 'Order creation failed. Please contact support with your payment details.';
    } else if (error.message.includes('configuration') || error.message.includes('secret')) {
      errorMessage = 'Payment system configuration error. Please contact support.';
    } else if (error.message.includes('COD')) {
      errorMessage = error.message; // COD errors are already user-friendly
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: error.message // Include technical details for debugging
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
