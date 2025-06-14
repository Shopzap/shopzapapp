
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, orderDetails } = await req.json();
    
    console.log('Generating invoice for order:', orderId);

    // Create the supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate HTML invoice
    const invoiceHtml = generateInvoiceHTML(orderDetails);
    
    // For now, we'll return a data URL that can be used to download the invoice
    // In a production environment, you might want to use a PDF generation service
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(invoiceHtml)}`;
    
    // Log the invoice generation
    await supabase.from('email_logs').insert({
      order_id: orderId,
      to_email: orderDetails.buyer_email,
      subject: `Invoice for Order #${orderId.slice(-8)}`,
      event_type: 'invoice_generated',
      status: 'completed'
    });

    return new Response(JSON.stringify({ 
      success: true, 
      downloadUrl: dataUrl,
      message: 'Invoice generated successfully' 
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function generateInvoiceHTML(orderDetails: any): string {
  const orderNumber = orderDetails.id.slice(-8);
  const orderDate = new Date(orderDetails.created_at).toLocaleDateString('en-IN');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Invoice #${orderNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #7b3fe4; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #7b3fe4; }
            .invoice-title { font-size: 28px; color: #333; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section { background: #f8f9fa; padding: 20px; border-radius: 8px; }
            .section h3 { color: #7b3fe4; margin-bottom: 15px; font-size: 16px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .info-label { font-weight: 600; color: #666; }
            .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .items-table th { background: #7b3fe4; color: white; font-weight: 600; }
            .items-table tr:nth-child(even) { background: #f8f9fa; }
            .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
            .total-final { font-size: 18px; font-weight: bold; color: #7b3fe4; border-top: 2px solid #7b3fe4; padding-top: 15px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            @media print { body { margin: 0; } .invoice-container { max-width: none; } }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="logo">ShopZap</div>
                <div class="invoice-title">INVOICE</div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
                <div class="section">
                    <h3>Bill To</h3>
                    <div class="info-row">
                        <span class="info-label">Name:</span>
                        <span>${orderDetails.buyer_name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span>${orderDetails.buyer_email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone:</span>
                        <span>${orderDetails.buyer_phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Address:</span>
                        <span>${orderDetails.buyer_address}</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Invoice Details</h3>
                    <div class="info-row">
                        <span class="info-label">Invoice #:</span>
                        <span>${orderNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Order Date:</span>
                        <span>${orderDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Store:</span>
                        <span>${orderDetails.stores.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Payment Status:</span>
                        <span style="color: #28a745; font-weight: bold;">Paid</span>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderDetails.order_items.map((item: any) => `
                        <tr>
                            <td>${item.products.name}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">₹${Number(item.price_at_purchase).toLocaleString()}</td>
                            <td style="text-align: right;">₹${(Number(item.price_at_purchase) * item.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Total Section -->
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹${Number(orderDetails.total_price).toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span style="color: #28a745;">Free</span>
                </div>
                <div class="total-row">
                    <span>Tax:</span>
                    <span>₹0</span>
                </div>
                <div class="total-row total-final">
                    <span>Total Amount:</span>
                    <span>₹${Number(orderDetails.total_price).toLocaleString()}</span>
                </div>
            </div>

            <!-- Seller Information -->
            <div class="section" style="margin-top: 30px;">
                <h3>Seller Information</h3>
                <div class="info-row">
                    <span class="info-label">Store Name:</span>
                    <span>${orderDetails.stores.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contact Email:</span>
                    <span>${orderDetails.stores.business_email}</span>
                </div>
                ${orderDetails.stores.phone_number ? `
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span>${orderDetails.stores.phone_number}</span>
                </div>
                ` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>Thank you for shopping with ${orderDetails.stores.name} on ShopZap!</p>
                <p style="margin-top: 10px; font-size: 12px;">
                    For support, contact us at support@shopzap.io
                </p>
            </div>
        </div>

        <script>
            // Auto-print when opened in new window
            if (window.location.href.startsWith('data:')) {
                setTimeout(() => window.print(), 500);
            }
        </script>
    </body>
    </html>
  `;
}
