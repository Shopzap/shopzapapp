
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', receipt }: CreateOrderRequest = await req.json();

    console.log(`Creating Razorpay order for amount: ${amount}, currency: ${currency}, receipt: ${receipt}`);

    // Get Razorpay credentials from environment variables
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY');
    
    console.log(`Razorpay Key ID: ${razorpayKeyId ? razorpayKeyId.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`Razorpay Secret: ${razorpaySecret ? razorpaySecret.substring(0, 10) + '...' : 'NOT SET'}`);
    
    if (!razorpayKeyId || !razorpaySecret) {
      console.error('Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment gateway not configured. Please contact support.',
          details: 'Missing API credentials'
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
          details: 'Amount must be greater than 0'
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
      receipt: receipt,
      payment_capture: 1 // Auto capture payment
    };

    console.log('Razorpay order payload:', orderData);

    // Create Basic Auth header - key_id:key_secret encoded in base64
    const credentials = `${razorpayKeyId}:${razorpaySecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(credentials);
    const encodedCredentials = btoa(String.fromCharCode(...Array.from(data)));
    
    console.log('Making request to Razorpay API...');
    console.log('Auth header preview:', `Basic ${encodedCredentials.substring(0, 20)}...`);

    // Make request to Razorpay Orders API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: JSON.stringify(orderData)
    });

    console.log(`Razorpay API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorMessage = 'Payment initialization failed';
      let userFriendlyMessage = 'Unable to process payment. Please try again or contact support.';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error.description || errorData.error.code || errorMessage;
          
          // Provide user-friendly messages for common errors
          if (errorData.error.code === 'BAD_REQUEST_ERROR') {
            if (errorMessage.includes('Authentication failed')) {
              userFriendlyMessage = 'Payment gateway configuration error. Please contact support.';
            } else if (errorMessage.includes('amount')) {
              userFriendlyMessage = 'Invalid payment amount. Please try again.';
            }
          } else if (response.status === 401) {
            userFriendlyMessage = 'Payment gateway authentication failed. Please contact support.';
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
          code: response.status
        }),
        {
          status: 400, // Return 400 instead of 500 to indicate client error
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const razorpayOrder = await response.json();
    console.log('Razorpay order created successfully:', {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status
    });

    return new Response(JSON.stringify({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt
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
        details: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
