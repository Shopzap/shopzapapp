
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { store_id } = await req.json()

    if (!store_id) {
      return new Response(
        JSON.stringify({ error: 'Store ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Instagram connection for the store
    const { data: connection, error: connectionError } = await supabaseClient
      .from('instagram_connections')
      .select('*')
      .eq('store_id', store_id)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'No active Instagram connection found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // In a real implementation, this would fetch from Instagram API via SendPulse
    // For now, we'll create some sample posts
    const samplePosts = [
      {
        post_id: `${store_id}_post_1`,
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
        caption: 'Latest collection showcase! 🛍️ #fashion',
        permalink: `https://instagram.com/p/sample1`,
        timestamp: new Date().toISOString()
      },
      {
        post_id: `${store_id}_post_2`,
        image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop',
        caption: 'Behind the scenes at our studio 📸',
        permalink: `https://instagram.com/p/sample2`,
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    // Insert/update posts in ig_feed table
    const postsToInsert = samplePosts.map(post => ({
      store_id,
      ...post
    }))

    const { data: insertedPosts, error: insertError } = await supabaseClient
      .from('ig_feed')
      .upsert(postsToInsert, { 
        onConflict: 'post_id',
        ignoreDuplicates: false 
      })
      .select()

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        posts_synced: insertedPosts?.length || 0,
        posts: insertedPosts
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error syncing Instagram feed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
