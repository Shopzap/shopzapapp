
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
import { ExternalLink, Plus, BarChart3, Zap, TrendingUp } from "lucide-react";
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
          <div className="relative mb-6">
            <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
            <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your store data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-3xl p-8 text-white overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Zap className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {storeData?.name || 'Store Owner'}! 👋
            </h1>
          </div>
          <p className="text-blue-100 text-lg">
            Your e-commerce empire awaits. Let's grow your business together.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
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
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              Analytics Hub
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Deep insights into your store performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/analytics">
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                <TrendingUp className="mr-2 h-4 w-4" />
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
