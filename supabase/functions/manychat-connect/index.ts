
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

    // Test the API token by fetching page data
    const pageResponse = await fetch('https://api.manychat.com/fb/page/getPages', {
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
    const pages = pageData.data || []
    
    console.log('Pages fetched from ManyChat:', pages.length)

    if (pages.length === 0) {
      throw new Error('No pages found in your ManyChat account. Please make sure you have connected your Instagram page to ManyChat.')
    }

    // Get the first Instagram-connected page or fallback to first page
    const instagramPage = pages.find((page: any) => page.instagram_id) || pages[0]

    if (!instagramPage) {
      throw new Error('No suitable page found. Please make sure your Instagram page is connected to ManyChat.')
    }

    console.log('Selected page:', { 
      id: instagramPage.id, 
      name: instagramPage.name,
      instagram_id: instagramPage.instagram_id 
    })

    return new Response(
      JSON.stringify({
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
