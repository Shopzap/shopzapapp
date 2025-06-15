
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Eye, FileText, Calendar } from 'lucide-react';
import InvoicePreviewModal from '@/components/invoice/InvoicePreviewModal';
import { useAuth } from '@/contexts/AuthContext';

const Invoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch orders for invoice generation
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-for-invoices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id);
      
      if (!stores?.length) return [];
      
      const storeIds = stores.map(store => store.id);
      
      const { data, error } = await supabase
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
        .in('store_id', storeIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredOrders = orders?.filter(order => 
    order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.includes(searchTerm)
  ) || [];

  const handleDownloadInvoice = async (order: any) => {
    try {
      toast({ title: "Generating invoice...", description: "Please wait a moment." });
      
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { orderId: order.id }
      });

      if (error) throw error;

      if (data.downloadUrl) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = data.downloadUrl;
        a.download = `invoice-${order.id.slice(-8)}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);

        toast({
          title: "Invoice Download Started",
          description: "Your invoice HTML file should be in your downloads.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate invoice download URL.');
      }
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewInvoice = (order: any) => {
    setSelectedInvoice(order);
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Invoice Management</h1>
        <p className="text-muted-foreground">Generate and manage invoices for your orders</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
          <CardDescription>
            Click on any order to generate or download its invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No orders match your search criteria.' : 'You don\'t have any orders yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">#{order.id.slice(-8)}</h4>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {order.payment_status}
                        </Badge>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Customer: {order.buyer_name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Email: {order.buyer_email || 'N/A'}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{Number(order.total_price).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Store: {order.stores?.name}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewInvoice(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadInvoice(order)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      {showPreview && selectedInvoice && (
        <InvoicePreviewModal
          order={selectedInvoice}
          open={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedInvoice(null);
          }}
          onDownload={() => handleDownloadInvoice(selectedInvoice)}
        />
      )}
    </div>
  );
};

export default Invoices;
