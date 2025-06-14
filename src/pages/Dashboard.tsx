
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StoreStats from "@/components/dashboard/StoreStats";
import RecentOrdersList from "@/components/dashboard/RecentOrdersList";
import { ReferralStats } from "@/components/dashboard/ReferralStats";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import StoreUrlCard from "@/components/dashboard/StoreUrlCard";
import { useStore } from "@/contexts/StoreContext";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Plus, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { storeData } = useStore();
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!storeData?.id) return;

      try {
        setIsLoading(true);
        
        // Fetch product count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id);
        
        if (productsCount !== null) {
          setProductCount(productsCount);
        }

        // Fetch orders data
        const { data: ordersData, count: totalOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersData) {
          setRecentOrders(ordersData);
        }
        
        if (totalOrdersCount !== null) {
          setOrderCount(totalOrdersCount);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [storeData?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {storeData?.name || 'Store Owner'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Store URL Card */}
      <StoreUrlCard storeData={storeData} />

      {/* Stats Overview */}
      <StoreStats 
        productCount={productCount} 
        orderCount={orderCount} 
        plan={storeData?.plan || 'free'} 
      />

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Referral Stats */}
        <ReferralStats />

        {/* Analytics Quick View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View detailed store analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/analytics">
              <Button className="w-full">
                View Analytics
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <RecentOrdersList 
        orders={recentOrders} 
        onCopyStoreLink={() => {
          if (storeData?.username) {
            const storeLink = `${window.location.origin}/store/${storeData.username}`;
            navigator.clipboard.writeText(storeLink);
          }
        }} 
      />
    </div>
  );
};

export default Dashboard;
