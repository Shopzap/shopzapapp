
import React from 'react';
import { Separator } from "@/components/ui/separator";

interface InvoiceTemplateProps {
  order: any;
}

const InvoiceTemplate = ({ order }: InvoiceTemplateProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateSubtotal = () => {
    return order.order_items?.reduce((total: number, item: any) => {
      return total + (Number(item.price_at_purchase) * item.quantity);
    }, 0) || 0;
  };

  const calculateTax = () => {
    // For now, we'll assume 18% GST
    return calculateSubtotal() * 0.18;
  };

  return (
    <div className="p-8 bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h1>
          <p className="text-gray-600">#{order.id.slice(-8)}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold mb-2">{order.stores?.name}</h2>
          <div className="text-sm text-gray-600">
            {order.stores?.business_email && <p>{order.stores.business_email}</p>}
            {order.stores?.phone_number && <p>{order.stores.phone_number}</p>}
            {order.stores?.address && <p>{order.stores.address}</p>}
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">BILL TO:</h3>
          <div className="text-sm">
            <p className="font-medium">{order.buyer_name}</p>
            {order.buyer_email && <p>{order.buyer_email}</p>}
            {order.buyer_phone && <p>{order.buyer_phone}</p>}
            {order.buyer_address && (
              <p className="mt-2 text-gray-600">{order.buyer_address}</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">INVOICE DETAILS:</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Invoice Date:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            {order.paid_at && (
              <div className="flex justify-between">
                <span>Payment Date:</span>
                <span>{formatDate(order.paid_at)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="capitalize">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="capitalize font-medium">{order.payment_status}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-gray-800">ITEMS:</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold">Item</th>
                <th className="text-center p-3 font-semibold">Qty</th>
                <th className="text-right p-3 font-semibold">Unit Price</th>
                <th className="text-right p-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item: any, index: number) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {item.products?.image_url && (
                        <img 
                          src={item.products.image_url} 
                          alt={item.products.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{item.products?.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">₹{Number(item.price_at_purchase).toLocaleString()}</td>
                  <td className="p-3 text-right font-medium">
                    ₹{(Number(item.price_at_purchase) * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (GST 18%):</span>
              <span>₹{calculateTax().toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{Number(order.total_price).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {order.razorpay_payment_id && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-800">PAYMENT INFORMATION:</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Payment ID:</span>
              <span className="font-mono">{order.razorpay_payment_id}</span>
            </div>
            {order.razorpay_order_id && (
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{order.razorpay_order_id}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-6 text-center text-sm text-gray-600">
        <p>Thank you for your business!</p>
        <p className="mt-2">This is a computer-generated invoice and does not require a signature.</p>
        {order.stores?.business_email && (
          <p className="mt-2">For any questions, please contact us at {order.stores.business_email}</p>
        )}
      </div>
    </div>
  );
};

export default InvoiceTemplate;
