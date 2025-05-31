import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, AlertTriangle, Package, Palette, Settings, PlusCircle, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StoreStats from '@/components/dashboard/StoreStats';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { siteConfig } from '@/config/site';

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
        
        // Fetch all orders from 'orders' table where store_id = current_user.store_id
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
  
  // Copy store link to clipboard
  const handleCopyStoreLink = () => {
    if (storeData) {
      const storeLink = siteConfig.store.generateUrl(storeData.name);
      navigator.clipboard.writeText(storeLink);
      toast({ title: "Store link copied!" });
    }
  };
  
  // Open store in new tab
  const handleOpenStore = () => {
    if (storeData) {
      const storeLink = siteConfig.store.generateUrl(storeData.name);
      window.open(storeLink, '_blank');
    }
  };
  
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
  
  if (!storeData) {
    return (
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
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container p-4 mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{storeData.name}</h1>
            <p className="text-muted-foreground">Welcome to your store dashboard</p>
          </div>
          {productCount === 0 ? (
            <Button onClick={() => navigate('/dashboard/products')} className="self-start w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add your first product
            </Button>
          ) : (
            <Button onClick={() => navigate('/dashboard/products')} className="self-start w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
        
        {/* Your Store Link Box */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Store Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm flex-1 truncate w-full">
                {siteConfig.store.generateUrl(storeData.name)}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={handleCopyStoreLink} className="flex-1">
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpenStore} className="flex-1">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards - Total Products, Total Orders, Current Plan */}
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
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.customer_email}</TableCell>
                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">No recent orders.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/products')}>
                <Package className="mr-2 h-4 w-4" /> Manage Products
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/customize')}>
                <Palette className="mr-2 h-4 w-4" /> Customize Storefront
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" /> Store Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;