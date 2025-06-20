
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
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
  const [thisWeekEarnings, setThisWeekEarnings] = useState(0);

  useEffect(() => {
    fetchPayouts();
    calculateThisWeekEarnings();
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

      const typedPayouts: PayoutRequest[] = (payoutData || []).map(payout => ({
        ...payout,
        status: payout.status as 'pending' | 'paid' | 'processing'
      }));

      setPayouts(typedPayouts);
      
      // Calculate totals
      const total = typedPayouts.reduce((sum, payout) => sum + payout.final_amount, 0);
      const pending = typedPayouts
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

  const calculateThisWeekEarnings = async () => {
    if (!storeData) return;

    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_price')
        .eq('store_id', storeData.id)
        .eq('status', 'delivered')
        .gte('created_at', weekStart.toISOString());

      if (error) throw error;

      const thisWeek = (orders || []).reduce((sum, order) => sum + order.total_price, 0);
      setThisWeekEarnings(thisWeek);
    } catch (error) {
      console.error('Error calculating this week earnings:', error);
    }
  };

  const requestPayout = async () => {
    if (pendingAmount <= 0) {
      toast({
        title: "No Pending Amount",
        description: "You don't have any pending amount to request payout",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Payout Requested",
      description: "Your payout request has been submitted and will be processed within 2-3 business days",
    });

    // Here you would implement the actual payout request logic
    setTimeout(() => {
      fetchPayouts();
    }, 1000);
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
        <Button onClick={requestPayout} disabled={pendingAmount <= 0}>
          <DollarSign className="mr-2 h-4 w-4" />
          Request Payout
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Payout Information</h3>
              <p className="text-sm text-blue-700 mt-1">
                Payouts are processed weekly on Fridays. Orders must be delivered and completed for 7 days before being eligible for payout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{thisWeekEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current week earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Friday</div>
            <p className="text-xs text-muted-foreground">Weekly schedule</p>
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
              <p className="text-muted-foreground">
                Payouts will appear here after your first sales are delivered and eligible
              </p>
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
                    <p className="font-semibold">₹{payout.total_earned.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Fee (3.9%)</p>
                    <p className="font-semibold text-red-600">-₹{payout.platform_fee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Final Amount</p>
                    <p className="font-semibold text-green-600">₹{payout.final_amount.toLocaleString()}</p>
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
                {payout.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      This payout is pending approval and will be processed within 2-3 business days.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Payouts;
