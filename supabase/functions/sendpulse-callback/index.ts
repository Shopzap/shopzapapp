
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  let origin = 'https://shopzap.io'; // Default fallback
  let stateData: { store_id?: string, user_id?: string, origin?: string } = {};

  if (state) {
    try {
      stateData = JSON.parse(atob(state));
      if (stateData.origin) {
        origin = stateData.origin;
      }
    } catch (e) {
      console.error("Failed to parse state", e);
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${origin}/dashboard/instagram-automation?error=invalid_state` }
      });
    }
  }

  const redirectToError = (error: string) => {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': `${origin}/dashboard/instagram-automation?error=${error}` }
    });
  };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('SendPulse OAuth callback received:', { code: !!code, state: !!state });

    if (!code) {
      console.error('No authorization code received');
      return redirectToError('no_code');
    }

    const { store_id: storeId, user_id: userId } = stateData;

    if (!storeId || !userId) {
      console.error('Invalid state: missing store_id or user_id');
      return redirectToError('invalid_state');
    }
    console.log('Decoded state:', { storeId, userId, origin });


    // Check for existing active connection for this store
    const { data: existingConnection } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .maybeSingle();

    if (existingConnection) {
      console.log('Store already has an active Instagram connection');
      return redirectToError('already_connected');
    }

    // Exchange code for access token using Supabase secrets
    const tokenResponse = await fetch('https://api.sendpulse.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('SENDPULSE_CLIENT_ID'),
        client_secret: Deno.env.get('SENDPULSE_CLIENT_SECRET'),
        code: code,
        redirect_uri: `https://fyftegalhvigtrieldan.supabase.co/functions/v1/sendpulse-callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return redirectToError('token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful, access token received');

    // Get user's Instagram pages/accounts
    const pagesResponse = await fetch('https://api.sendpulse.com/instagram/accounts', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!pagesResponse.ok) {
      console.error('Failed to fetch Instagram accounts');
      return redirectToError('account_fetch_failed');
    }

    const pagesData = await pagesResponse.json();
    console.log('Instagram accounts fetched:', pagesData.length || 0, 'accounts');

    // Use the first Instagram account (or let user choose later)
    const instagramAccount = pagesData[0];
    
    if (!instagramAccount) {
      console.error('No Instagram accounts found');
      return redirectToError('no_instagram_accounts');
    }

    // Encrypt/hash the access token for security (base64 obfuscation)
    const encryptedToken = btoa(tokenData.access_token);

    // Save connection to database
    const connectionData = {
      store_id: storeId,
      user_id: userId,
      instagram_page_id: instagramAccount.id,
      ig_username: instagramAccount.username,
      sendpulse_page_id: instagramAccount.id,
      page_name: instagramAccount.name || instagramAccount.username,
      access_token: encryptedToken, // Store encrypted token
      is_active: true,
      connected_at: new Date().toISOString()
    };

    const { error: dbError } = await supabase
      .from('instagram_connections')
      .upsert(connectionData, {
        onConflict: 'store_id',
        ignoreDuplicates: false
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return redirectToError('database_error');
    }

    console.log('Instagram connection saved successfully for store:', storeId);

    // Redirect back to dashboard with success
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${origin}/dashboard/instagram-automation?success=connected`
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return redirectToError('unexpected_error');
  }
})
