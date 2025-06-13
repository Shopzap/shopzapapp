
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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { code, state } = new URL(req.url).searchParams
    console.log('OAuth callback received:', { code, state })

    if (!code || !state) {
      throw new Error('Missing OAuth code or state parameter')
    }

    // Decode the state to get store_id and user_id
    const stateData = JSON.parse(atob(state))
    const { store_id, user_id } = stateData

    // Exchange code for access token with SendPulse
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
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/sendpulse-oauth`
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful')

    // Get Instagram page info using the access token
    const pageResponse = await fetch('https://api.sendpulse.com/instagram/pages', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!pageResponse.ok) {
      throw new Error('Failed to fetch Instagram page info')
    }

    const pageData = await pageResponse.json()
    const instagramPage = pageData[0] // Assuming first page

    // Save connection to database
    const { error } = await supabase
      .from('instagram_connections')
      .upsert({
        store_id: store_id,
        instagram_page_id: instagramPage.id,
        ig_username: instagramPage.username,
        sendpulse_page_id: instagramPage.id,
        page_name: instagramPage.name,
        access_token: tokenData.access_token,
        is_active: true,
        connected_at: new Date().toISOString()
      })

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save connection')
    }

    console.log('Instagram connection saved successfully')

    // Redirect back to dashboard with success message
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `/dashboard/instagram-automation?success=connected`
      }
    })

  } catch (error) {
    console.error('OAuth error:', error)
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `/dashboard/instagram-automation?error=${encodeURIComponent(error.message)}`
      }
    })
  }
})
