
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sheetUrl } = await req.json()
    
    if (!sheetUrl || !sheetUrl.includes('docs.google.com/spreadsheets')) {
      return new Response(JSON.stringify({ error: 'Invalid Google Sheets URL' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!sheetIdMatch) {
      return new Response(JSON.stringify({ error: 'Could not extract sheet ID from URL' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const sheetId = sheetIdMatch[1]
    const clientEmail = Deno.env.get('GOOGLE_SHEETS_CLIENT_EMAIL')
    const privateKey = Deno.env.get('GOOGLE_SHEETS_PRIVATE_KEY')

    if (!clientEmail || !privateKey) {
      return new Response(JSON.stringify({ error: 'Google Sheets API credentials not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Create JWT token for Google API authentication
    const now = Math.floor(Date.now() / 1000)
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    }

    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    // Import JWT signing function
    const { create } = await import('https://deno.land/x/djwt@v3.0.2/mod.ts')
    const key = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(privateKey.replace(/\\n/g, '\n')),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const jwt = await create(header, payload, key)

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch sheet data
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:E`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    if (!sheetsResponse.ok) {
      throw new Error('Failed to fetch sheet data. Make sure the sheet is shared with the service account.')
    }

    const sheetsData = await sheetsResponse.json()
    const rows = sheetsData.values || []

    if (rows.length < 2) {
      return new Response(JSON.stringify({ error: 'Sheet must have at least a header row and one data row' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get user and store info
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, username')
      .eq('user_id', user.id)
      .single()

    if (storeError || !storeData) {
      return new Response(JSON.stringify({ error: 'Store not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Process sheet data (skip header row)
    const dataRows = rows.slice(1)
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }

    for (const row of dataRows) {
      try {
        const [name, description, price, imageUrl, category] = row
        
        if (!name || !price) {
          results.failed++
          results.errors.push(`Row missing required fields: ${row.join(', ')}`)
          continue
        }

        const productPrice = parseFloat(price)
        if (isNaN(productPrice) || productPrice <= 0) {
          results.failed++
          results.errors.push(`Invalid price for product: ${name}`)
          continue
        }

        // Generate unique slug
        const baseSlug = name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)
        
        const { data: existingProducts } = await supabase
          .from('products')
          .select('slug')
          .eq('store_id', storeData.id)
          .ilike('slug', `${baseSlug}%`)

        let slug = baseSlug
        let counter = 1
        while (existingProducts?.some(p => p.slug === slug)) {
          slug = `${baseSlug}-${counter}`
          counter++
        }

        const productData = {
          store_id: storeData.id,
          user_id: user.id,
          name: name.trim(),
          description: description?.trim() || null,
          price: productPrice,
          image_url: imageUrl?.trim() || null,
          category: category?.trim() || null,
          slug,
          status: 'active',
          is_published: true,
          payment_method: 'both',
          inventory_count: 10
        }

        const { error: insertError } = await supabase
          .from('products')
          .insert(productData)

        if (insertError) {
          results.failed++
          results.errors.push(`Failed to insert product ${name}: ${insertError.message}`)
        } else {
          results.success++
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Error processing row: ${error.message}`)
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Import error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
