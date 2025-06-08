
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
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
    const { amount, currency = 'INR', receipt, isTestMode = true }: CreateOrderRequest = await req.json();

    console.log(`[${isTestMode ? 'TEST MODE' : 'LIVE MODE'}] Creating Razorpay order for amount: ${amount}, currency: ${currency}, receipt: ${receipt}`);

    // Get Razorpay credentials from environment variables
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY');
    
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Razorpay Key ID: ${razorpayKeyId ? razorpayKeyId.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Razorpay Secret: ${razorpaySecret ? razorpaySecret.substring(0, 10) + '...' : 'NOT SET'}`);
    
    // Validate test mode keys
    if (isTestMode && razorpayKeyId && !razorpayKeyId.startsWith('rzp_test_')) {
      console.warn('WARNING: Test mode enabled but key does not appear to be a test key');
    }
    
    if (!razorpayKeyId || !razorpaySecret) {
      console.error('Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment gateway not configured. Please contact support.',
          details: 'Missing API credentials',
          testMode: isTestMode
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate amount (must be positive)
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid payment amount',
          details: 'Amount must be greater than 0',
          testMode: isTestMode
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Razorpay order payload
    const orderData = {
      amount: Math.round(amount * 100), // Convert rupees to paise and ensure integer
      currency: currency.toUpperCase(),
      receipt: `${isTestMode ? 'TEST_' : ''}${receipt}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        test_mode: isTestMode ? 'true' : 'false',
        environment: isTestMode ? 'test' : 'production'
      }
    };

    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Razorpay order payload:`, orderData);

    // Create Basic Auth header using btoa (base64 encoding)
    const credentials = `${razorpayKeyId}:${razorpaySecret}`;
    const encodedCredentials = btoa(credentials);
    
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Making request to Razorpay API...`);

    // Make request to Razorpay Orders API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: JSON.stringify(orderData)
    });

    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Razorpay API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${isTestMode ? 'TEST' : 'LIVE'}] Razorpay API error response:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorMessage = 'Payment initialization failed';
      let userFriendlyMessage = `Unable to process payment${isTestMode ? ' (TEST MODE)' : ''}. Please try again or contact support.`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error.description || errorData.error.code || errorMessage;
          
          // Provide user-friendly messages for common errors
          if (errorData.error.code === 'BAD_REQUEST_ERROR') {
            if (errorMessage.includes('Authentication failed')) {
              userFriendlyMessage = `Payment gateway authentication failed${isTestMode ? ' (TEST MODE)' : ''}. Please contact support.`;
            } else if (errorMessage.includes('amount')) {
              userFriendlyMessage = 'Invalid payment amount. Please try again.';
            }
          } else if (response.status === 401) {
            userFriendlyMessage = `Payment gateway authentication failed${isTestMode ? ' (TEST MODE)' : ''}. Please contact support.`;
          }
        }
      } catch (parseError) {
        console.error('Failed to parse Razorpay error response:', parseError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userFriendlyMessage,
          details: errorMessage,
          code: response.status,
          testMode: isTestMode
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const razorpayOrder = await response.json();
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Razorpay order created successfully:`, {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status,
      testMode: isTestMode
    });

    return new Response(JSON.stringify({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      testMode: isTestMode,
      testMessage: isTestMode ? 'This is a test transaction. Use test card: 4111 1111 1111 1111' : undefined
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in create-razorpay-order function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Payment service temporarily unavailable. Please try again.',
        details: error.message || 'Internal server error',
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
