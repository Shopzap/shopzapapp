import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, ShoppingCart, Users, Percent } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { apiRequest } from '../services/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface SalesOverTimeData {
  date: string;
  revenue: number;
}

interface BestSellingProduct {
  name: string;
  unitsSold: number;
  revenue: number;
}

interface AnalyticsData {
  totalOrders: number;
  uniqueCustomers: number;
  totalRevenue: number;
  conversionRate: number;
  salesOverTime: SalesOverTimeData[];
  bestSellingProducts: BestSellingProduct[];
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Replace with actual storeId from context or props
        const storeId = 'your-store-id'; // TODO: Replace with dynamic store ID
        const response = await apiRequest(`/store/${storeId}/analytics`, 'GET');
        setAnalyticsData(response);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) return <div className="p-4">Loading analytics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!analyticsData) return <div className="p-4">No analytics data available.</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Analytics Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={analyticsData.totalOrders}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="+20.1% from last month"
        />
        <StatCard
          title="Unique Customers"
          value={analyticsData.uniqueCustomers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="+18.5% from last month"
        />
        <StatCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="+15.3% from last month"
        />
        <StatCard
          title="Conversion Rate"
          value={`${analyticsData.conversionRate}%`}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
          description="+3.1% from last month"
        />
      </div>

      {/* Sales Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for Sales Chart */}
          <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md text-gray-500">
            Sales Chart Placeholder
          </div>
        </CardContent>
      </Card>

      {/* Best Selling Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.bestSellingProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.unitsSold}</TableCell>
                  <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;