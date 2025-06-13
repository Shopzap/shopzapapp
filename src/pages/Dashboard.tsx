
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStoreUrl } from '@/utils/storeRouting';
import MainLayout from '@/components/layouts/MainLayout';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StoreUrlCard from '@/components/dashboard/StoreUrlCard';
import StoreStats from '@/components/dashboard/StoreStats';
import RecentOrdersList from '@/components/dashboard/RecentOrdersList';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get current user from Supabase auth
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session?.user) {
          navigate('/auth');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get store data from 'stores' table where user_id = current_user.id
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
        
        // Fetch all products from 'products' table where store_id = store.id and count them
        const { count: productsCount, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id);
        
        if (!productError && productsCount !== null) {
          setProductCount(productsCount);
        }
        
        // Fetch orders from 'orders' table where store_id = store.id
        const { data: ordersData, error: ordersError, count: totalOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        
        if (!ordersError && ordersData) {
          // Set recent orders (limit 3 for display)
          setRecentOrders(ordersData.slice(0, 3));
          // Set total order count
          setOrderCount(totalOrdersCount || 0);
        }
        
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast({
          title: "Error loading dashboard",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate, toast]);

  // Copy store link to clipboard for RecentOrdersList
  const handleCopyStoreLink = () => {
    if (storeData) {
      const storeLink = getStoreUrl(storeData, '', true);
      navigator.clipboard.writeText(storeLink);
      toast({ title: "Store link copied!" });
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!storeData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>No Store Found</CardTitle>
              <CardDescription>You need to create a store first</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/onboarding')} className="w-full">Create Your Store</Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container p-4 mx-auto space-y-6">
        <DashboardHeader storeName={storeData.name} productCount={productCount} />
        
        <StoreUrlCard storeData={storeData} />
        
        <StoreStats 
          productCount={productCount} 
          orderCount={orderCount} 
          plan={storeData.plan} 
        />
        
        {/* Recent Orders Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/orders')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecentOrdersList orders={recentOrders} onCopyStoreLink={handleCopyStoreLink} />
          </CardContent>
        </Card>
        
        <QuickActionsCard />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
