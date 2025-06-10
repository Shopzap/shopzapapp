
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, storeId } = await req.json()

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Exchange code for access token using your centralized ManyChat app credentials
    const tokenResponse = await fetch('https://api.manychat.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('MANYCHAT_CLIENT_ID') || '',
        client_secret: Deno.env.get('MANYCHAT_CLIENT_SECRET') || '',
        code: code,
        redirect_uri: `${Deno.env.get('SITE_URL') || 'https://shopzap.io'}/dashboard/instagram`
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch page data from ManyChat using the seller's access token
    const pageResponse = await fetch('https://api.manychat.com/fb/page/getPages', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!pageResponse.ok) {
      const errorText = await pageResponse.text()
      console.error('Page fetch failed:', errorText)
      throw new Error('Failed to fetch page data')
    }

    const pageData = await pageResponse.json()
    const pages = pageData.data || []
    
    if (pages.length === 0) {
      throw new Error('No pages found in ManyChat account')
    }

    // Get the first Instagram-connected page or fallback to first page
    const instagramPage = pages.find((page: any) => page.instagram_id) || pages[0]

    return new Response(
      JSON.stringify({
        access_token: accessToken,
        instagram_page_id: instagramPage.instagram_id || instagramPage.id,
        bot_id: instagramPage.id,
        page_name: instagramPage.name,
        instagram_username: instagramPage.instagram_username || instagramPage.name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('ManyChat OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
