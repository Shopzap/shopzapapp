
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { CreateOrderRequest, SuccessResponse } from './types.ts';
import { validateCredentials, validateAmount } from './validation.ts';
import { createOrderPayload, createRazorpayOrder } from './razorpay-service.ts';
import { handleRazorpayError, handleGenericError } from './error-handler.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', receipt, isTestMode = true }: CreateOrderRequest = await req.json();

    // Ensure amount is treated as rupees, not paise
    const amountInRupees = typeof amount === 'number' ? amount : parseFloat(amount);
    
    console.log(`[${isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Creating Razorpay order for amount: ₹${amountInRupees}, currency: ${currency}, receipt: ${receipt}`);

    // Get ShopZap.io Razorpay credentials from environment variables and TRIM whitespace
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')?.trim();
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY')?.trim();
    
    // Validate credentials
    const credentialsValidation = validateCredentials(razorpayKeyId, razorpaySecret, isTestMode);
    if (!credentialsValidation.isValid) {
      return new Response(
        JSON.stringify(credentialsValidation.error),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate amount (ensure it's in rupees, not paise)
    const amountValidation = validateAmount(amountInRupees, isTestMode);
    if (!amountValidation.isValid) {
      return new Response(
        JSON.stringify(amountValidation.error),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Razorpay order payload (this will convert rupees to paise internally)
    const orderData = createOrderPayload(amountInRupees, currency, receipt, isTestMode);

    // Make request to Razorpay Orders API
    const response = await createRazorpayOrder(orderData, razorpayKeyId!, razorpaySecret!, isTestMode);

    if (!response.ok) {
      const errorResponse = await handleRazorpayError(response, isTestMode, razorpayKeyId!);
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const razorpayOrder = await response.json();
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] ShopZap Razorpay order created successfully:`, {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status,
      testMode: isTestMode,
      platform: 'ShopZap.io',
      originalAmountRupees: amountInRupees
    });

    const successResponse: SuccessResponse = {
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // This will be in paise
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      testMode: isTestMode,
      testMessage: isTestMode ? 'This is a test transaction using ShopZap.io account. Use test card: 4111 1111 1111 1111' : undefined,
      keyId: razorpayKeyId!, // Return the key ID for frontend use
      platform: 'ShopZap.io'
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    const errorResponse = handleGenericError(error);
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
