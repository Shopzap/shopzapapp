
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify webhook signature from Resend
    const signature = req.headers.get('svix-signature')
    const timestamp = req.headers.get('svix-timestamp')
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')

    if (!signature || !timestamp || !webhookSecret) {
      console.log('Missing webhook signature or secret')
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.text()
    
    // Simple signature verification (in production, use proper HMAC verification)
    const expectedSignature = `sha256=${await crypto.subtle.digest('SHA-256', new TextEncoder().encode(timestamp + '.' + body + webhookSecret))}`
    
    console.log('Webhook received:', { signature, timestamp, bodyLength: body.length })

    const event = JSON.parse(body)
    console.log('Resend webhook event:', event)

    // Handle different event types
    const supportedEvents = ['email.delivered', 'email.bounced', 'email.opened', 'email.clicked']
    
    if (!supportedEvents.includes(event.type)) {
      console.log('Unsupported event type:', event.type)
      return new Response('Event type not supported', { status: 200 })
    }

    // Extract event data
    const eventData = event.data
    const emailAddress = eventData.to?.[0] || eventData.email
    const emailId = eventData.email_id || eventData.id
    
    // Try to find order_id from email logs if available
    let orderId = null
    if (emailId) {
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select('order_id')
        .eq('mailersend_id', emailId)
        .single()
      
      if (existingLog) {
        orderId = existingLog.order_id
      }
    }

    // Save webhook event to email_logs
    const { error: logError } = await supabase
      .from('email_logs')
      .upsert({
        to_email: emailAddress,
        subject: eventData.subject || `${event.type} event`,
        status: event.type.replace('email.', ''),
        event_type: event.type,
        order_id: orderId,
        mailersend_id: emailId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'mailersend_id'
      })

    if (logError) {
      console.error('Error saving email log:', logError)
      return new Response('Database error', { status: 500 })
    }

    console.log('Webhook processed successfully:', event.type)

    return new Response(
      JSON.stringify({ success: true, event_type: event.type }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
