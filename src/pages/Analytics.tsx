import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, DollarSign, Users, Percent } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useStore } from '@/contexts/StoreContext';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeId, isLoadingStore } = useStore();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (isLoadingStore) return; // Wait for storeId to be loaded

      if (!storeId) {
        setError('Store ID not found. Please ensure you have a store set up.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('supabase.auth.token');
        const accessToken = token ? JSON.parse(token).access_token : null;

        if (!accessToken) {
          throw new Error('No access token found. Please log in.');
        }

        const response = await fetch(`http://localhost:3000/api/store/${storeId}/analytics`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load analytics data.');
        }

        const data = await response.json();
        setAnalyticsData(data);
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
    return <div className="p-6">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!analyticsData || analyticsData.totalOrders === 0) {
    return <div className="p-6">No analytics data available for this store yet.</div>;
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
            {analyticsData.topProducts.map((product: any) => (
              <TableRow key={product.product_name}>
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