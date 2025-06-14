
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

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    
    console.log('SendPulse OAuth callback received:', { code: !!code, state })

    if (!code) {
      console.error('No authorization code received')
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://shopzap.io/dashboard/instagram-automation?error=no_code'
        }
      })
    }

    // Decode state to get store_id and user_id
    let storeId, userId
    if (state) {
      try {
        const stateData = JSON.parse(atob(state))
        storeId = stateData.store_id
        userId = stateData.user_id
        console.log('Decoded state:', { storeId, userId })
      } catch (err) {
        console.error('Error decoding state:', err)
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': 'https://shopzap.io/dashboard/instagram-automation?error=invalid_state'
          }
        })
      }
    }

    // Check for existing active connection for this store
    const { data: existingConnection } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .maybeSingle()

    if (existingConnection) {
      console.log('Store already has an active Instagram connection')
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://shopzap.io/dashboard/instagram-automation?error=already_connected'
        }
      })
    }

    // Exchange code for access token
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
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://shopzap.io/dashboard/instagram-automation?error=token_exchange_failed'
        }
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful, access token received')

    // Get user's Instagram pages/accounts
    const pagesResponse = await fetch('https://api.sendpulse.com/instagram/accounts', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!pagesResponse.ok) {
      console.error('Failed to fetch Instagram accounts')
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://shopzap.io/dashboard/instagram-automation?error=account_fetch_failed'
        }
      })
    }

    const pagesData = await pagesResponse.json()
    console.log('Instagram accounts fetched:', pagesData.length || 0, 'accounts')

    // Use the first Instagram account (or let user choose later)
    const instagramAccount = pagesData[0]
    
    if (!instagramAccount) {
      console.error('No Instagram accounts found')
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://shopzap.io/dashboard/instagram-automation?error=no_instagram_accounts'
        }
      })
    }

    // Encrypt/hash the access token for security (basic obfuscation)
    const encryptedToken = btoa(tokenData.access_token)

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
    }

    const { error: dbError } = await supabase
      .from('instagram_connections')
      .upsert(connectionData, {
        onConflict: 'store_id',
        ignoreDuplicates: false
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://shopzap.io/dashboard/instagram-automation?error=database_error'
        }
      })
    }

    console.log('Instagram connection saved successfully for store:', storeId)

    // Redirect back to dashboard with success
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://shopzap.io/dashboard/instagram-automation?success=connected'
      }
    })

  } catch (error) {
    console.error('OAuth callback error:', error)
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://shopzap.io/dashboard/instagram-automation?error=unexpected_error'
      }
    })
  }
})
