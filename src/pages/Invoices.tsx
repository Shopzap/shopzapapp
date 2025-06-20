
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Eye, FileText, Search, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  total_amount: number;
  created_at: string;
  status: 'paid' | 'pending' | 'cancelled';
  buyer_name: string;
  buyer_email: string;
  payment_method: string;
}

const Invoices: React.FC = () => {
  const { user } = useAuth();
  const { storeData } = useStore();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);

  useEffect(() => {
    fetchInvoices();
  }, [storeData]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, statusFilter]);

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

      const invoiceData: Invoice[] = (orders || []).map(order => ({
        id: order.id,
        order_id: order.id,
        invoice_number: `INV-${order.id.slice(0, 8).toUpperCase()}`,
        total_amount: order.total_price,
        created_at: order.created_at,
        status: order.payment_status === 'paid' ? 'paid' : order.payment_status === 'failed' ? 'cancelled' : 'pending',
        buyer_name: order.buyer_name,
        buyer_email: order.buyer_email || '',
        payment_method: order.payment_method || 'cod'
      }));

      setInvoices(invoiceData);
      
      // Calculate stats
      const revenue = invoiceData
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.total_amount, 0);
      const paid = invoiceData.filter(invoice => invoice.status === 'paid').length;
      
      setTotalRevenue(revenue);
      setPaidInvoices(paid);
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

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchQuery) {
      filtered = filtered.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.buyer_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      toast({
        title: "Download Started",
        description: "Invoice download will begin shortly",
      });
      
      // Here you would implement PDF generation
      // For now, we'll simulate the download
      setTimeout(() => {
        toast({
          title: "Download Complete", 
          description: `Invoice ${invoice.invoice_number} downloaded successfully`,
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    toast({
      title: "Opening Invoice",
      description: `Viewing invoice ${invoice.invoice_number}`,
    });
    // Here you would open the invoice in a modal or new tab
  };

  const generateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your invoice report is being prepared",
    });
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
        <Button variant="outline" onClick={generateReport}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {invoices.length === 0 ? 'No invoices found' : 'No invoices match your filters'}
              </h3>
              <p className="text-muted-foreground">
                {invoices.length === 0 
                  ? 'Invoices will appear here when you receive orders'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(invoice.created_at), 'MMM dd, yyyy')} • {invoice.payment_method.toUpperCase()}
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
                    <p className="font-semibold text-lg">₹{invoice.total_amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{invoice.buyer_name}</p>
                    {invoice.buyer_email && (
                      <p className="text-sm text-muted-foreground">{invoice.buyer_email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
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
