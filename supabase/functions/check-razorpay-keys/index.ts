
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    // Check if Razorpay keys are available
    const testKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const testKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const liveKeyId = Deno.env.get("RAZORPAY_LIVE_KEY_ID");
    const liveKeySecret = Deno.env.get("RAZORPAY_LIVE_KEY_SECRET");

    let available = false;
    let mode = 'test';
    let keyId = '';

    // Check live keys first
    if (liveKeyId && liveKeySecret) {
      available = true;
      mode = 'live';
      keyId = liveKeyId;
    } else if (testKeyId && testKeySecret) {
      available = true;
      mode = 'test';
      keyId = testKeyId;
    }

    console.log('Razorpay availability check:', { available, mode });

    return new Response(JSON.stringify({ 
      available,
      mode,
      keyId: available ? keyId : null
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  } catch (error) {
    console.error('Error checking Razorpay keys:', error);
    return new Response(
      JSON.stringify({ available: false, error: error.message }),
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
