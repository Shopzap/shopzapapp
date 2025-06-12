
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  isTestMode?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', receipt, isTestMode = true }: RazorpayOrderRequest = await req.json();

    console.log(`[${isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Creating Razorpay order for amount: ${amount}`);

    // Get Razorpay credentials from environment variables
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')?.trim();
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim();

    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Key ID available: ${razorpayKeyId ? 'YES' : 'NO'}`);
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Key Secret available: ${razorpayKeySecret ? 'YES' : 'NO'}`);

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      throw new Error(`Payment gateway not configured${isTestMode ? ' (TEST MODE)' : ''}. Please check API keys.`);
    }

    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount. Amount must be greater than 0.');
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create order payload
    const orderPayload = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt,
      payment_capture: 1
    };

    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Order payload:`, orderPayload);

    // Create Basic Auth header
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    // Make request to Razorpay API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    const responseData = await response.json();
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Razorpay API response:`, responseData);

    if (!response.ok) {
      console.error('Razorpay API error:', responseData);
      
      // Handle specific Razorpay errors
      if (response.status === 401) {
        throw new Error(`Authentication failed${isTestMode ? ' (TEST MODE)' : ''}. Please check your API keys.`);
      } else if (response.status === 400) {
        throw new Error(`Bad request${isTestMode ? ' (TEST MODE)' : ''}. ${responseData.error?.description || 'Invalid parameters'}`);
      } else {
        throw new Error(`Payment gateway error${isTestMode ? ' (TEST MODE)' : ''}. ${responseData.error?.description || 'Unknown error'}`);
      }
    }

    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Order created successfully:`, responseData.id);

    return new Response(JSON.stringify({
      success: true,
      razorpayOrderId: responseData.id,
      amount: responseData.amount,
      currency: responseData.currency,
      keyId: razorpayKeyId, // Return key ID for frontend use
      testMode: isTestMode,
      testMessage: isTestMode ? 'This is a test order. Use test card 4111 1111 1111 1111' : undefined
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in create-razorpay-order function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        testMode: true // Default to test mode for errors
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
