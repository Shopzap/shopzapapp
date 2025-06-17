
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
    const { to_email, seller_name, amount, paid_at, orders_count, payout_method } = await req.json()

    if (!to_email || !seller_name || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format the payment date
    const formattedDate = paid_at ? new Date(paid_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Get Resend API key from secrets
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not found')
    }

    // Email content
    const emailSubject = `Your Weekly Payout from ShopZap – ₹${amount.toLocaleString()}`
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payout Confirmation</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .header p { color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .payout-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .payout-amount { color: white; font-size: 36px; font-weight: bold; margin: 0; }
            .payout-label { color: #d1fae5; font-size: 14px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .detail-item { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .detail-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0; }
            .detail-value { font-size: 16px; color: #1e293b; font-weight: 600; margin: 0; }
            .info-section { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0; }
            .info-title { color: #92400e; font-weight: 600; margin: 0 0 8px 0; }
            .info-text { color: #a16207; margin: 0; line-height: 1.5; }
            .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer p { color: #64748b; margin: 0; font-size: 14px; }
            .footer .logo { color: #3b82f6; font-weight: bold; font-size: 18px; margin-bottom: 8px; }
            @media (max-width: 600px) {
                .details-grid { grid-template-columns: 1fr; }
                .header, .content { padding: 20px; }
                .payout-card { padding: 20px; }
                .payout-amount { font-size: 28px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Payout Processed!</h1>
                <p>Your weekly earnings have been successfully transferred</p>
            </div>
            
            <div class="content">
                <p style="font-size: 18px; color: #1e293b; margin: 0 0 20px 0;">
                    Hi <strong>${seller_name}</strong>,
                </p>
                
                <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
                    Great news! Your weekly payout from ShopZap has been successfully processed and transferred to your account.
                </p>

                <div class="payout-card">
                    <p class="payout-label">Payout Amount</p>
                    <h2 class="payout-amount">₹${amount.toLocaleString()}</h2>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <p class="detail-label">Payment Method</p>
                        <p class="detail-value">${payout_method || 'Bank Transfer'}</p>
                    </div>
                    <div class="detail-item">
                        <p class="detail-label">Processed On</p>
                        <p class="detail-value">${formattedDate}</p>
                    </div>
                    <div class="detail-item">
                        <p class="detail-label">Orders Included</p>
                        <p class="detail-value">${orders_count} ${orders_count === 1 ? 'order' : 'orders'}</p>
                    </div>
                    <div class="detail-item">
                        <p class="detail-label">Status</p>
                        <p class="detail-value" style="color: #10b981;">✅ Completed</p>
                    </div>
                </div>

                <div class="info-section">
                    <p class="info-title">💡 Payment Timeline</p>
                    <p class="info-text">
                        Depending on your bank, it may take 1-3 business days for the amount to reflect in your account. 
                        If you don't see the payment after 3 business days, please contact our support team.
                    </p>
                </div>

                <p style="color: #64748b; line-height: 1.6; margin: 30px 0 0 0;">
                    Thank you for being a valued seller on ShopZap! Keep up the great work, and we look forward to processing many more successful payouts for you.
                </p>

                <p style="color: #64748b; margin: 20px 0 0 0;">
                    Best regards,<br>
                    <strong>The ShopZap Team</strong>
                </p>
            </div>

            <div class="footer">
                <p class="logo">⚡ ShopZap</p>
                <p>Building the future of e-commerce, one store at a time.</p>
                <p style="margin-top: 16px; font-size: 12px;">
                    If you have any questions about your payout, please reply to this email or contact our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ShopZap <noreply@shopzap.io>',
        to: [to_email],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const emailData = await emailResponse.json()

    // Log the email in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase
      .from('email_logs')
      .insert({
        to_email,
        subject: emailSubject,
        status: 'sent',
        event_type: 'payout_confirmation',
        mailersend_id: emailData.id,
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payout email sent successfully',
        email_id: emailData.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending payout email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send payout email' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
