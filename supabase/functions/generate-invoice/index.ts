
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceRequest {
  orderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId }: InvoiceRequest = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order data
    const { data: order, error } = await supabase
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

    if (error || !order) {
      throw new Error('Order not found');
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Helper function to add text with line wrapping
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 10) => {
      doc.setFontSize(fontSize);
      if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
      } else {
        doc.text(text, x, y);
        return y + (fontSize * 0.4);
      }
    };

    // Header
    doc.setFontSize(24);
    doc.setTextColor(25, 118, 210); // Blue color
    doc.text('INVOICE', 20, yPosition);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`#${order.id.slice(-8)}`, 20, yPosition + 10);

    // Store information (right aligned)
    doc.setFontSize(16);
    doc.text(order.stores?.name || 'Store', pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 15;
    doc.setFontSize(10);
    if (order.stores?.business_email) {
      doc.text(order.stores.business_email, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 5;
    }
    if (order.stores?.phone_number) {
      doc.text(order.stores.phone_number, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 5;
    }
    if (order.stores?.address) {
      yPosition = addText(order.stores.address, pageWidth - 20, yPosition, 80, 10);
    }

    yPosition += 20;

    // Bill To section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('BILL TO:', 20, yPosition);
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPosition = addText(order.buyer_name, 20, yPosition, 80, 10);
    if (order.buyer_email) {
      yPosition = addText(order.buyer_email, 20, yPosition + 3, 80, 10);
    }
    if (order.buyer_phone) {
      yPosition = addText(order.buyer_phone, 20, yPosition + 3, 80, 10);
    }
    if (order.buyer_address) {
      yPosition = addText(order.buyer_address, 20, yPosition + 3, 80, 10);
    }

    // Invoice details (right side)
    let rightYPosition = yPosition - 30;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE DETAILS:', pageWidth - 80, rightYPosition);
    rightYPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Invoice Date:', pageWidth - 80, rightYPosition);
    doc.text(new Date(order.created_at).toLocaleDateString('en-IN'), pageWidth - 20, rightYPosition, { align: 'right' });
    rightYPosition += 5;

    if (order.paid_at) {
      doc.text('Payment Date:', pageWidth - 80, rightYPosition);
      doc.text(new Date(order.paid_at).toLocaleDateString('en-IN'), pageWidth - 20, rightYPosition, { align: 'right' });
      rightYPosition += 5;
    }

    doc.text('Payment Method:', pageWidth - 80, rightYPosition);
    doc.text(order.payment_method || 'N/A', pageWidth - 20, rightYPosition, { align: 'right' });
    rightYPosition += 5;

    doc.text('Status:', pageWidth - 80, rightYPosition);
    doc.text(order.payment_status || 'pending', pageWidth - 20, rightYPosition, { align: 'right' });

    yPosition = Math.max(yPosition, rightYPosition) + 20;

    // Items table
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ITEMS:', 20, yPosition);
    yPosition += 10;

    // Table headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Item', 20, yPosition);
    doc.text('Qty', 120, yPosition, { align: 'center' });
    doc.text('Unit Price', 140, yPosition, { align: 'right' });
    doc.text('Total', pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 3;

    // Draw line under headers
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;

    // Table items
    doc.setFont(undefined, 'normal');
    let subtotal = 0;

    order.order_items?.forEach((item: any) => {
      const itemTotal = Number(item.price_at_purchase) * item.quantity;
      subtotal += itemTotal;

      doc.text(item.products?.name || 'Product', 20, yPosition, { maxWidth: 90 });
      doc.text(item.quantity.toString(), 120, yPosition, { align: 'center' });
      doc.text(`₹${Number(item.price_at_purchase).toLocaleString()}`, 140, yPosition, { align: 'right' });
      doc.text(`₹${itemTotal.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;
    });

    yPosition += 10;

    // Totals
    const totalsX = pageWidth - 80;
    doc.text('Subtotal:', totalsX, yPosition);
    doc.text(`₹${subtotal.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 6;

    doc.text('Shipping:', totalsX, yPosition);
    doc.text('Free', pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 6;

    const tax = subtotal * 0.18;
    doc.text('Tax (GST 18%):', totalsX, yPosition);
    doc.text(`₹${tax.toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 8;

    // Draw line above total
    doc.line(totalsX, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Total:', totalsX, yPosition);
    doc.text(`₹${Number(order.total_price).toLocaleString()}`, pageWidth - 20, yPosition, { align: 'right' });

    yPosition += 20;

    // Payment information
    if (order.razorpay_payment_id) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('PAYMENT INFORMATION:', 20, yPosition);
      yPosition += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Payment ID: ${order.razorpay_payment_id}`, 20, yPosition);
      if (order.razorpay_order_id) {
        yPosition += 5;
        doc.text(`Order ID: ${order.razorpay_order_id}`, 20, yPosition);
      }
      yPosition += 15;
    }

    // Footer
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, yPosition, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id.slice(-8)}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate invoice' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
