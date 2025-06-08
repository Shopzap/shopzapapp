
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
    
    console.log(`Razorpay Key ID present: ${!!razorpayKeyId}`);
    console.log(`Razorpay Secret present: ${!!razorpaySecret}`);
    
    if (!razorpayKeyId || !razorpaySecret) {
      console.error('Missing Razorpay credentials:', { 
        keyId: !!razorpayKeyId, 
        secret: !!razorpaySecret 
      });
      throw new Error('Payment gateway credentials not configured');
    }

    // Validate amount (must be positive and in paise)
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      throw new Error('Invalid amount provided');
    }

    // Create Razorpay order payload
    const orderData = {
      amount: Math.round(amount * 100), // Convert rupees to paise and ensure integer
      currency: currency.toUpperCase(),
      receipt: receipt,
      payment_capture: 1 // Auto capture payment
    };

    console.log('Razorpay order payload:', orderData);

    // Create Basic Auth header
    const authString = `${razorpayKeyId}:${razorpaySecret}`;
    const encodedAuth = btoa(authString);
    
    console.log('Making request to Razorpay API...');

    // Make request to Razorpay Orders API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedAuth}`
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
      
      let errorMessage = 'Failed to create payment order';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.description) {
          errorMessage = errorData.error.description;
        }
      } catch (parseError) {
        console.error('Failed to parse Razorpay error response:', parseError);
      }
      
      throw new Error(errorMessage);
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
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
