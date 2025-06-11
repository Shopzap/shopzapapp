
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
    const { apiToken, storeId } = await req.json()

    console.log('ManyChat connect function called with:', { 
      hasToken: !!apiToken, 
      storeId 
    })

    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: 'API token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test the API token by fetching page data - using correct endpoint
    const pageResponse = await fetch('https://api.manychat.com/fb/page/getInfo', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!pageResponse.ok) {
      const errorText = await pageResponse.text()
      console.error('ManyChat API error:', errorText)
      
      if (pageResponse.status === 401) {
        throw new Error('Invalid API token. Please check your ManyChat API token.')
      }
      
      throw new Error('Failed to connect to ManyChat. Please check your API token.')
    }

    const pageData = await pageResponse.json()
    
    console.log('Page data fetched from ManyChat:', pageData)

    if (!pageData.data) {
      throw new Error('No page data found in your ManyChat account.')
    }

    const page = pageData.data

    if (!page) {
      throw new Error('No page found. Please make sure your Instagram page is connected to ManyChat.')
    }

    console.log('Selected page:', { 
      id: page.id, 
      name: page.name,
      instagram_id: page.instagram_id 
    })

    return new Response(
      JSON.stringify({
        instagram_page_id: page.instagram_id || page.id,
        bot_id: page.id,
        page_name: page.name,
        instagram_username: page.instagram_username || page.name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('ManyChat connect error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
