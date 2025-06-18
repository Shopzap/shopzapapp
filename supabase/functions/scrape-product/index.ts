
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

    const scraperApiKey = Deno.env.get('SCRAPER_API_KEY')
    if (!scraperApiKey) {
      return new Response(JSON.stringify({ error: 'ScraperAPI key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Use ScraperAPI to fetch the page content
    const scraperUrl = `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`
    
    const response = await fetch(scraperUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    })

    if (!response.ok) {
      throw new Error(`ScraperAPI failed: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    
    let productData = {
      name: '',
      price: '',
      description: '',
      image_url: '',
    }

    const hostname = new URL(url).hostname
    
    if (hostname.includes('amazon')) {
      // Amazon-specific parsing
      const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>(.*?)<\/span>/s)
      productData.name = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : ''
      
      const priceMatch = html.match(/<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>(.*?)<\/span>/s) ||
                        html.match(/₹([\d,]+)/g)
      productData.price = priceMatch ? priceMatch[0].replace(/[₹,]/g, '').trim() : ''
      
      const imageMatch = html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]*)"/) ||
                        html.match(/<img[^>]*data-old-hires="([^"]*)"/)
      productData.image_url = imageMatch ? imageMatch[1] : ''
      
      // Extract bullet points for description
      const bulletRegex = /<span[^>]*class="[^"]*a-list-item[^"]*"[^>]*>(.*?)<\/span>/gs
      const bullets = []
      let match
      while ((match = bulletRegex.exec(html)) !== null && bullets.length < 5) {
        const bullet = match[1].replace(/<[^>]*>/g, '').trim()
        if (bullet && bullet.length > 10) {
          bullets.push(bullet)
        }
      }
      productData.description = bullets.join('\n')
      
    } else if (hostname.includes('flipkart')) {
      // Flipkart-specific parsing
      const titleMatch = html.match(/<span[^>]*class="[^"]*B_NuCI[^"]*"[^>]*>(.*?)<\/span>/s) ||
                        html.match(/<h1[^>]*class="[^"]*yhB1nd[^"]*"[^>]*>(.*?)<\/h1>/s)
      productData.name = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : ''
      
      const priceMatch = html.match(/₹([\d,]+)/g)
      productData.price = priceMatch ? priceMatch[0].replace(/[₹,]/g, '').trim() : ''
      
      const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*alt="[^"]*"/) ||
                        html.match(/<img[^>]*class="[^"]*_396cs4[^"]*"[^>]*src="([^"]*)"/)
      productData.image_url = imageMatch ? imageMatch[1] : ''
      
    } else if (hostname.includes('meesho')) {
      // Meesho-specific parsing
      const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/s) ||
                        html.match(/<span[^>]*class="[^"]*sc-eDvSVe[^"]*"[^>]*>(.*?)<\/span>/s)
      productData.name = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : ''
      
      const priceMatch = html.match(/₹([\d,]+)/g)
      productData.price = priceMatch ? priceMatch[0].replace(/[₹,]/g, '').trim() : ''
      
      const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*alt/)
      productData.image_url = imageMatch ? imageMatch[1] : ''
      
    } else {
      // Generic fallback using OpenGraph meta tags
      const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                        html.match(/<title[^>]*>(.*?)<\/title>/s)
      productData.name = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : ''
      
      const priceMatch = html.match(/<meta[^>]*property="product:price:amount"[^>]*content="([^"]*)"/) ||
                        html.match(/₹([\d,]+)/g)
      productData.price = priceMatch ? priceMatch[1] || priceMatch[0].replace(/[₹,]/g, '').trim() : ''
      
      const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/)
      productData.description = descMatch ? descMatch[1].trim() : ''
      
      const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)
      productData.image_url = imageMatch ? imageMatch[1] : ''
    }
    
    if (!productData.name) {
      throw new Error('Could not automatically find product details on this page. Please enter them manually.')
    }

    // Clean up the data
    productData.name = productData.name.replace(/\s+/g, ' ').trim()
    productData.description = productData.description.replace(/\s+/g, ' ').trim()
    
    return new Response(JSON.stringify(productData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
