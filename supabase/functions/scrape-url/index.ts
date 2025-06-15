
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url || !URL.canParse(url)) {
      return new Response(JSON.stringify({ error: 'A valid URL is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    let productData = {
      name: '',
      price: '',
      description: '',
      image_url: '',
    }

    const hostname = new URL(url).hostname
    
    if (hostname.includes('amazon')) {
      productData.name = $('#productTitle').text().trim()
      productData.price = $('.a-price-whole').first().text().replace(/[,.]/g, '')
      productData.image_url = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src') || ''
      
      const descriptionLines: string[] = []
      $('#feature-bullets .a-list-item').each((_i, el) => {
        descriptionLines.push($(el).text().trim())
      })
      productData.description = descriptionLines.join('\n')
    } else {
      // Generic fallback using OpenGraph meta tags
      productData.name = $('meta[property="og:title"]').attr('content') || $('title').text().trim()
      productData.price = $('meta[property="product:price:amount"]').attr('content') || ''
      productData.description = $('meta[property="og:description"]').attr('content') || ''
      productData.image_url = $('meta[property="og:image"]').attr('content') || ''
    }
    
    if (!productData.name) {
        throw new Error('Could not automatically find product details on this page. Please enter them manually.');
    }

    return new Response(JSON.stringify(productData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
