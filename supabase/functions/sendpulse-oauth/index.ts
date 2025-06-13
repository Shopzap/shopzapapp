
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPulseTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface SendPulseUserInfo {
  email: string;
  name?: string;
  id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('SendPulse OAuth callback received:', { code: !!code, state, error });

    // Handle OAuth error
    if (error) {
      console.error('OAuth error:', error);
      const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('Authentication failed: ' + error)}`;
      return Response.redirect(redirectUrl, 302);
    }

    if (!code) {
      console.error('No authorization code received');
      const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('No authorization code received')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Parse state to get store and user info
    let storeId: string;
    let userId: string;
    
    try {
      const stateData = JSON.parse(atob(state || ''));
      storeId = stateData.store_id;
      userId = stateData.user_id;
      
      if (!storeId || !userId) {
        throw new Error('Missing store_id or user_id in state');
      }
    } catch (parseError) {
      console.error('Error parsing state:', parseError);
      const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('Invalid authentication state')}`;
      return Response.redirect(redirectUrl, 302);
    }

    console.log('Parsed state:', { storeId, userId });

    // Get SendPulse credentials
    const clientId = Deno.env.get('SENDPULSE_CLIENT_ID');
    const clientSecret = Deno.env.get('SENDPULSE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('SendPulse credentials not configured');
      const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('SendPulse credentials not configured')}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth.sendpulse.com/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${url.origin}/functions/v1/sendpulse-oauth`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('Failed to exchange authorization code')}`;
      return Response.redirect(redirectUrl, 302);
    }

    const tokenData: SendPulseTokenResponse = await tokenResponse.json();
    console.log('Token exchange successful');

    // Fetch user info
    let userInfo: SendPulseUserInfo = { email: 'unknown@sendpulse.com' };
    
    try {
      const userInfoResponse = await fetch('https://api.sendpulse.com/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (userInfoResponse.ok) {
        userInfo = await userInfoResponse.json();
        console.log('User info fetched successfully');
      } else {
        console.warn('Failed to fetch user info, using default');
      }
    } catch (userInfoError) {
      console.warn('Error fetching user info:', userInfoError);
    }

    // Fetch Instagram pages/accounts from SendPulse
    let igUsername = 'unknown';
    let instagramPageId = 'unknown';
    let pageName = 'Instagram Account';

    try {
      const pagesResponse = await fetch('https://api.sendpulse.com/instagram/account', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        console.log('Instagram pages data:', pagesData);
        
        // Extract Instagram account info (this may vary based on SendPulse API response structure)
        if (pagesData && pagesData.length > 0) {
          const firstPage = pagesData[0];
          igUsername = firstPage.username || firstPage.name || 'unknown';
          instagramPageId = firstPage.id || 'unknown';
          pageName = firstPage.name || 'Instagram Account';
        }
      }
    } catch (pagesError) {
      console.warn('Error fetching Instagram pages:', pagesError);
    }

    // Save connection to database
    const { data: existingConnection } = await supabaseClient
      .from('instagram_connections')
      .select('id')
      .eq('store_id', storeId)
      .eq('connected', true)
      .maybeSingle();

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseClient
        .from('instagram_connections')
        .update({
          access_token: tokenData.access_token,
          email: userInfo.email,
          ig_username: igUsername,
          instagram_page_id: instagramPageId,
          page_name: pageName,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConnection.id);

      if (updateError) {
        console.error('Error updating Instagram connection:', updateError);
        const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('Failed to update connection')}`;
        return Response.redirect(redirectUrl, 302);
      }
    } else {
      // Create new connection
      const { error: insertError } = await supabaseClient
        .from('instagram_connections')
        .insert({
          store_id: storeId,
          user_id: userId,
          access_token: tokenData.access_token,
          email: userInfo.email,
          ig_username: igUsername,
          instagram_page_id: instagramPageId,
          page_name: pageName,
          connected: true,
        });

      if (insertError) {
        console.error('Error saving Instagram connection:', insertError);
        const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('Failed to save connection')}`;
        return Response.redirect(redirectUrl, 302);
      }
    }

    console.log('Instagram connection saved successfully');

    // Redirect to success page
    const redirectUrl = `${url.origin}/instagram-automation?success=connected`;
    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('OAuth handler error:', error);
    const url = new URL(req.url);
    const redirectUrl = `${url.origin}/instagram-automation?error=${encodeURIComponent('Authentication failed')}`;
    return Response.redirect(redirectUrl, 302);
  }
};

serve(handler);
