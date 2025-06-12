
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Set the auth header for this request
    supabase.auth.getSession = async () => {
      const token = authHeader.replace('Bearer ', '')
      const { data } = await supabase.auth.getUser(token)
      return { data: { session: { user: data.user } } }
    }

    const { store_id, product_id, trigger_keywords } = await req.json()

    if (!store_id || !trigger_keywords || trigger_keywords.length === 0) {
      throw new Error('Missing required fields')
    }

    // Verify user owns the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', store_id)
      .single()

    if (storeError || !store) {
      throw new Error('Store not found or unauthorized')
    }

    // Save automation
    const { data, error } = await supabase
      .from('ig_automations')
      .insert({
        store_id,
        product_id: product_id || null,
        trigger_keywords
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save automation')
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Save automation error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
