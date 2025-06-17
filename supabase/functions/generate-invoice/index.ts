
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceData {
  orderId: string;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

const generateInvoiceHTML = (data: InvoiceData): string => {
  const formatValue = (value: string | null | undefined, defaultValue: string = 'Not provided') => {
    if (!value || value === 'undefined' || value.trim() === '') {
      return defaultValue;
    }
    return value;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${data.orderId}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .invoice { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #eee; 
            padding-bottom: 20px; 
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #333; 
        }
        .invoice-details { 
            text-align: right; 
        }
        .invoice-number { 
            font-size: 18px; 
            font-weight: bold; 
            color: #666; 
        }
        .date { 
            color: #888; 
            margin-top: 5px; 
        }
        .parties { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
        }
        .party { 
            width: 45%; 
        }
        .party h3 { 
            margin: 0 0 10px 0; 
            color: #333; 
            font-size: 16px; 
        }
        .party p { 
            margin: 5px 0; 
            color: #666; 
            line-height: 1.4; 
        }
        .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
        }
        .items-table th, .items-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #eee; 
        }
        .items-table th { 
            background: #f8f9fa; 
            font-weight: bold; 
            color: #333; 
        }
        .items-table .text-right { 
            text-align: right; 
        }
        .totals { 
            margin-left: auto; 
            width: 300px; 
        }
        .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
        }
        .total-row.final { 
            border-bottom: 2px solid #333; 
            font-weight: bold; 
            font-size: 18px; 
            color: #333; 
        }
        .payment-info { 
            margin-top: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 6px; 
        }
        .payment-info h3 { 
            margin: 0 0 10px 0; 
            color: #333; 
        }
        .payment-status { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
        }
        .payment-status.paid { 
            background: #d4edda; 
            color: #155724; 
        }
        .payment-status.pending { 
            background: #fff3cd; 
            color: #856404; 
        }
        .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #888; 
            font-size: 14px; 
        }
        .download-btn { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px; 
            font-weight: bold; 
        }
        .download-btn:hover { 
            background: #0056b3; 
        }
        @media print {
            body { background: white; }
            .download-btn { display: none; }
            .invoice { box-shadow: none; }
        }
    </style>
</head>
<body>
    <button class="download-btn" onclick="window.print()">📄 Download PDF</button>
    
    <div class="invoice">
        <div class="header">
            <div class="logo">${formatValue(data.storeName, 'Store')}</div>
            <div class="invoice-details">
                <div class="invoice-number">Invoice #${data.orderId.slice(-8)}</div>
                <div class="date">${new Date(data.orderDate).toLocaleDateString()}</div>
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <h3>From:</h3>
                <p><strong>${formatValue(data.storeName, 'Store')}</strong></p>
                <p>${formatValue(data.storeEmail, 'Email not provided')}</p>
                <p>${formatValue(data.storePhone, 'Phone not provided')}</p>
                ${data.storeAddress ? `<p>${formatValue(data.storeAddress, 'Address not provided')}</p>` : ''}
            </div>
            <div class="party">
                <h3>To:</h3>
                <p><strong>${formatValue(data.buyerName, 'Customer')}</strong></p>
                <p>${formatValue(data.buyerEmail, 'Email not provided')}</p>
                <p>${formatValue(data.buyerPhone, 'Phone not provided')}</p>
                ${data.buyerAddress ? `<p>${formatValue(data.buyerAddress, 'Address not provided')}</p>` : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₹${item.price.toLocaleString()}</td>
                        <td class="text-right">₹${item.total.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${data.subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
                <span>Shipping:</span>
                <span>₹${data.shipping.toLocaleString()}</span>
            </div>
            <div class="total-row final">
                <span>Total:</span>
                <span>₹${data.total.toLocaleString()}</span>
            </div>
        </div>

        <div class="payment-info">
            <h3>Payment Information</h3>
            <p>
                <strong>Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                <span class="payment-status ${data.paymentStatus === 'paid' ? 'paid' : 'pending'}">
                    ${data.paymentStatus}
                </span>
            </p>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>This invoice was generated on ${new Date().toLocaleDateString()}</p>
            <p style="margin-top: 10px; font-size: 12px;">
                Powered by <strong>ShopZap.io</strong> - Create your online store today!
            </p>
        </div>
    </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('Generating invoice for order:', orderId);

    // Fetch order details with related data
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url
          )
        ),
        stores (
          name,
          business_email,
          phone_number,
          address
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    if (!order) {
      throw new Error('Order not found');
    }

    console.log('Order found:', { id: order.id, store: order.stores?.name });

    // Prepare invoice data with proper fallbacks
    const invoiceData: InvoiceData = {
      orderId: order.id,
      storeName: order.stores?.name || 'Unknown Store',
      storeEmail: order.stores?.business_email || '',
      storePhone: order.stores?.phone_number || '',
      storeAddress: order.stores?.address || '',
      buyerName: order.buyer_name || 'Customer',
      buyerEmail: order.buyer_email || '',
      buyerPhone: order.buyer_phone || '',
      buyerAddress: order.buyer_address || '',
      orderDate: order.created_at,
      items: (order.order_items || []).map((item: any) => ({
        name: item.products?.name || 'Unknown Product',
        quantity: item.quantity,
        price: Number(item.price_at_purchase),
        total: Number(item.price_at_purchase) * item.quantity
      })),
      subtotal: Number(order.total_price),
      shipping: 0,
      total: Number(order.total_price),
      paymentMethod: order.payment_method || 'cod',
      paymentStatus: order.payment_status || 'pending'
    };

    console.log('Invoice data prepared for order:', orderId);

    const htmlContent = generateInvoiceHTML(invoiceData);

    return new Response(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in generate-invoice function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Invoice generation failed',
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
