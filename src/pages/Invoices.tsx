
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  total_amount: number;
  created_at: string;
  status: 'paid' | 'pending' | 'cancelled';
  buyer_name: string;
  buyer_email: string;
}

const Invoices: React.FC = () => {
  const { user } = useAuth();
  const { storeData } = useStore();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [storeData]);

  const fetchInvoices = async () => {
    if (!storeData) return;

    try {
      setIsLoading(true);
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform orders to invoice format
      const invoiceData: Invoice[] = (orders || []).map(order => ({
        id: order.id,
        order_id: order.id,
        invoice_number: `INV-${order.id.slice(0, 8)}`,
        total_amount: order.total_price,
        created_at: order.created_at,
        status: order.payment_status === 'paid' ? 'paid' : order.payment_status === 'failed' ? 'cancelled' : 'pending',
        buyer_name: order.buyer_name,
        buyer_email: order.buyer_email || ''
      }));

      setInvoices(invoiceData);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    toast({
      title: "Download Started",
      description: "Invoice download will begin shortly",
    });
    // TODO: Implement PDF generation
  };

  const handleViewInvoice = (invoiceId: string) => {
    window.open(`/invoice/${invoiceId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground">Invoices will appear here when you receive orders</p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant={
                    invoice.status === 'paid' ? 'default' : 
                    invoice.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">₹{invoice.total_amount}</p>
                    <p className="text-sm text-muted-foreground">{invoice.buyer_name}</p>
                    <p className="text-sm text-muted-foreground">{invoice.buyer_email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Invoices;
