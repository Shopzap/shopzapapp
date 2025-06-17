
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting weekly payout generation...')

    // Generate weekly payout requests using the database function
    const { data: eligiblePayouts, error: functionError } = await supabase
      .rpc('generate_weekly_payout_requests')

    if (functionError) {
      console.error('Error calling generate_weekly_payout_requests:', functionError)
      throw functionError
    }

    console.log(`Found ${eligiblePayouts?.length || 0} eligible payouts`)

    if (!eligiblePayouts || eligiblePayouts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No eligible orders for payout generation',
          payouts_created: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate week dates (Sunday to Saturday)
    const currentDate = new Date()
    const currentDay = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDay) // Go to Sunday
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Saturday
    weekEnd.setHours(23, 59, 59, 999)

    console.log(`Week range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`)

    // Create payout requests
    const payoutRequestsToInsert = eligiblePayouts.map((payout: any) => ({
      seller_id: payout.seller_id,
      store_id: payout.store_id,
      total_earned: parseFloat(payout.total_earned),
      platform_fee: parseFloat(payout.platform_fee),
      final_amount: parseFloat(payout.final_amount),
      order_ids: payout.order_ids,
      week_start_date: weekStart.toISOString().split('T')[0],
      week_end_date: weekEnd.toISOString().split('T')[0],
      status: 'pending'
    }))

    console.log('Inserting payout requests:', payoutRequestsToInsert.length)

    const { data: insertedPayouts, error: insertError } = await supabase
      .from('payout_requests')
      .insert(payoutRequestsToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting payout requests:', insertError)
      throw insertError
    }

    console.log(`Successfully created ${insertedPayouts?.length || 0} payout requests`)

    // Log the generation activity
    for (const payout of insertedPayouts || []) {
      await supabase
        .from('payout_logs')
        .insert({
          payout_request_id: payout.id,
          action: 'auto_generated',
          performed_by: 'system',
          details: {
            orders_count: payout.order_ids.length,
            generation_date: new Date().toISOString(),
            week_start: weekStart.toISOString(),
            week_end: weekEnd.toISOString()
          }
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated ${insertedPayouts?.length || 0} payout requests`,
        payouts_created: insertedPayouts?.length || 0,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        eligible_payouts: eligiblePayouts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in weekly payout generation:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate weekly payouts',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
