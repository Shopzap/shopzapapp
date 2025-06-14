
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const webhookData = await req.json();
    console.log('SendPulse webhook received:', webhookData);

    // Extract relevant data from webhook
    const {
      event_type,
      instagram_user_id,
      message_text,
      chatbot_id,
      page_id
    } = webhookData;

    // Find the store associated with this Instagram connection
    const { data: connection } = await supabase
      .from('instagram_connections')
      .select('*, stores(*)')
      .eq('sendpulse_page_id', page_id)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection) {
      console.log('No active connection found for page_id:', page_id);
      return new Response('Connection not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Log the DM interaction
    const { error: logError } = await supabase
      .from('ig_dm_logs')
      .insert({
        store_id: connection.store_id,
        trigger_type: event_type,
        recipient_id: instagram_user_id,
        trigger_data: {
          message_text,
          chatbot_id,
          page_id,
          timestamp: new Date().toISOString()
        },
        status: 'received'
      });

    if (logError) {
      console.error('Error logging DM interaction:', logError);
    }

    // Process automation triggers based on message content
    if (event_type === 'message_received' && message_text) {
      await processAutomationTriggers(supabase, connection.store_id, message_text, instagram_user_id);
    }

    // Update analytics
    await updateDMAnalytics(supabase, connection.store_id, event_type);

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processAutomationTriggers(supabase: any, storeId: string, messageText: string, userId: string) {
  // Get automation rules for this store
  const { data: automations } = await supabase
    .from('ig_automations')
    .select('*, products(*)')
    .eq('store_id', storeId);

  if (!automations) return;

  const lowerMessage = messageText.toLowerCase();

  for (const automation of automations) {
    const matchedKeywords = automation.trigger_keywords.filter((keyword: string) => 
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      console.log(`Triggered automation for keywords: ${matchedKeywords.join(', ')}`);
      
      // Here you would trigger the SendPulse chatbot flow
      // This is where you'd integrate with SendPulse's chatbot API
      // to send automated responses based on the matched keywords
      
      // Log the trigger
      await supabase
        .from('ig_dm_logs')
        .update({
          status: 'triggered',
          message_sent: `Automation triggered for keywords: ${matchedKeywords.join(', ')}`
        })
        .eq('recipient_id', userId)
        .eq('store_id', storeId);
    }
  }
}

async function updateDMAnalytics(supabase: any, storeId: string, eventType: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Update or create analytics record for today
  const { data: existingAnalytics } = await supabase
    .from('ig_dm_analytics')
    .select('*')
    .eq('store_id', storeId)
    .eq('date', today)
    .maybeSingle();

  if (existingAnalytics) {
    // Update existing record
    const updates: any = {};
    if (eventType === 'message_received') {
      updates.total_dms_sent = (existingAnalytics.total_dms_sent || 0) + 1;
    }

    await supabase
      .from('ig_dm_analytics')
      .update(updates)
      .eq('id', existingAnalytics.id);
  } else {
    // Create new analytics record
    await supabase
      .from('ig_dm_analytics')
      .insert({
        store_id: storeId,
        date: today,
        total_dms_sent: eventType === 'message_received' ? 1 : 0
      });
  }
}
