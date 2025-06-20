
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface PayoutRequest {
  id: string;
  total_earned: number;
  platform_fee: number;
  final_amount: number;
  status: 'pending' | 'paid' | 'processing';
  created_at: string;
  paid_at: string | null;
  week_start_date: string;
  week_end_date: string;
  order_ids: string[];
}

const Payouts: React.FC = () => {
  const { user } = useAuth();
  const { storeData } = useStore();
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    fetchPayouts();
  }, [storeData]);

  const fetchPayouts = async () => {
    if (!storeData) return;

    try {
      setIsLoading(true);
      const { data: payoutData, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayouts(payoutData || []);
      
      // Calculate totals
      const total = (payoutData || []).reduce((sum, payout) => sum + payout.final_amount, 0);
      const pending = (payoutData || [])
        .filter(payout => payout.status === 'pending')
        .reduce((sum, payout) => sum + payout.final_amount, 0);
      
      setTotalEarnings(total);
      setPendingAmount(pending);
    } catch (error: any) {
      console.error('Error fetching payouts:', error);
      toast({
        title: "Error",
        description: "Failed to load payout information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold">Payouts</h1>
        <Button variant="outline">
          <DollarSign className="mr-2 h-4 w-4" />
          Request Payout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Weekly</div>
            <p className="text-xs text-muted-foreground">Every Friday</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Payout History</h2>
        
        {payouts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payouts yet</h3>
              <p className="text-muted-foreground">Payouts will appear here after your first sales</p>
            </CardContent>
          </Card>
        ) : (
          payouts.map((payout) => (
            <Card key={payout.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Week {format(new Date(payout.week_start_date), 'MMM dd')} - {format(new Date(payout.week_end_date), 'MMM dd, yyyy')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {payout.order_ids.length} orders processed
                    </p>
                  </div>
                  <Badge variant={
                    payout.status === 'paid' ? 'default' : 
                    payout.status === 'processing' ? 'secondary' : 'destructive'
                  }>
                    {payout.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="font-semibold">₹{payout.total_earned}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                    <p className="font-semibold text-red-600">-₹{payout.platform_fee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Final Amount</p>
                    <p className="font-semibold text-green-600">₹{payout.final_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {payout.paid_at ? 'Paid On' : 'Requested On'}
                    </p>
                    <p className="font-semibold">
                      {format(new Date(payout.paid_at || payout.created_at), 'MMM dd, yyyy')}
                    </p>
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

export default Payouts;
