
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import MainLayout from '@/components/layouts/MainLayout';

const Analytics = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session?.user) {
          navigate('/auth');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get store data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (storeError || !storeData) {
          toast({
            title: "Store not found",
            description: "Please complete seller onboarding first",
            variant: "destructive"
          });
          navigate('/onboarding');
          return;
        }
        
        setStoreData(storeData);
        
        // Fetch analytics data
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('store_id', storeData.id);
        
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id);
        
        const totalOrders = ordersData?.length || 0;
        const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        setAnalyticsData({
          totalOrders,
          totalRevenue,
          totalProducts: productsCount || 0,
          avgOrderValue,
          recentOrders: ordersData?.slice(0, 10) || []
        });
        
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast({
          title: "Error loading analytics",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container p-4 mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Math.round(analyticsData.avgOrderValue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Coming soon - Detailed analytics charts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Analytics charts will be available soon
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Analytics;
