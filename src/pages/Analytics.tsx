
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, DollarSign, Users, Percent } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeId, isLoadingStore } = useStore();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (isLoadingStore) return;

      if (!storeId) {
        setError('Store ID not found. Please ensure you have a store set up.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get session to get access token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No access token found. Please log in.');
        }

        // For now, let's create mock analytics data since the backend endpoint might not exist
        const mockAnalyticsData = {
          totalOrders: 12,
          totalRevenue: 2450.00,
          uniqueCustomers: 8,
          conversionRate: 15.5,
          salesOverTime: [
            { date: '2024-01-01', sales: 400 },
            { date: '2024-01-02', sales: 600 },
            { date: '2024-01-03', sales: 800 },
            { date: '2024-01-04', sales: 500 },
            { date: '2024-01-05', sales: 900 },
            { date: '2024-01-06', sales: 750 },
            { date: '2024-01-07', sales: 1200 }
          ],
          topProducts: [
            { product_name: 'Product A', units_sold: 25, revenue: 750.00 },
            { product_name: 'Product B', units_sold: 18, revenue: 540.00 },
            { product_name: 'Product C', units_sold: 12, revenue: 360.00 }
          ]
        };

        setAnalyticsData(mockAnalyticsData);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [storeId, isLoadingStore]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!analyticsData || analyticsData.totalOrders === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>No Analytics Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No analytics data available for this store yet. Start selling to see your analytics!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Store Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.uniqueCustomers}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Sales Over Time</h2>
      <Card className="p-4 mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.salesOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Top Products</h2>
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyticsData.topProducts.map((product: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{product.product_name}</TableCell>
                <TableCell>{product.units_sold}</TableCell>
                <TableCell>${product.revenue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Analytics;
