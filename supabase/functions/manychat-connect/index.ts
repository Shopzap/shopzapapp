
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('ManyChat connect function called')
    
    const { apiToken, storeId } = await req.json()

    console.log('Request data:', { 
      hasToken: !!apiToken, 
      storeId,
      tokenLength: apiToken?.length 
    })

    // Validate required parameters
    if (!apiToken) {
      console.error('Missing API token')
      return new Response(
        JSON.stringify({ error: 'API token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!storeId) {
      console.error('Missing store ID')
      return new Response(
        JSON.stringify({ error: 'Store ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test the API token by fetching page data using ManyChat API
    console.log('Testing ManyChat API token...')
    const pageResponse = await fetch('https://api.manychat.com/fb/page/getInfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('ManyChat API response status:', pageResponse.status)

    if (!pageResponse.ok) {
      const errorText = await pageResponse.text()
      console.error('ManyChat API error:', {
        status: pageResponse.status,
        statusText: pageResponse.statusText,
        error: errorText
      })
      
      if (pageResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid API token. Please check your ManyChat API token and ensure it has the correct permissions.' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      if (pageResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: 'API token does not have sufficient permissions. Please ensure your token has page access.' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to connect to ManyChat API (${pageResponse.status}). Please check your API token and try again.` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const pageData = await pageResponse.json()
    console.log('ManyChat page data received:', {
      hasData: !!pageData.data,
      dataType: typeof pageData.data,
      keys: pageData.data ? Object.keys(pageData.data) : []
    })

    if (!pageData.data) {
      console.error('No page data found in ManyChat response')
      return new Response(
        JSON.stringify({ error: 'No page data found in your ManyChat account. Please ensure your Instagram page is connected to ManyChat.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const page = pageData.data

    // Validate page data
    if (!page.id) {
      console.error('Page ID missing from ManyChat response')
      return new Response(
        JSON.stringify({ error: 'Invalid page data received from ManyChat. Please check your account setup.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('ManyChat page info:', { 
      id: page.id, 
      name: page.name || 'Unknown',
      instagram_id: page.instagram_id || 'Not connected',
      instagram_username: page.instagram_username || 'Not available'
    })

    // Prepare response data
    const responseData = {
      instagram_page_id: page.instagram_id || page.id,
      bot_id: page.id,
      page_name: page.name || 'Connected Page',
      instagram_username: page.instagram_username || page.name || 'Unknown'
    }

    console.log('Sending success response:', responseData)

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in ManyChat connect function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred while connecting to ManyChat. Please try again.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
