
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, AlertTriangle, Package, Palette, Settings, PlusCircle, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import RecentOrdersList from '@/components/dashboard/RecentOrdersList';
import StoreStats from '@/components/dashboard/StoreStats';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [productCount, setProductCount] = useState(0);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session?.user) {
          navigate('/login');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Fetch store data
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
        
        // Fetch recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (!ordersError && ordersData) {
          setRecentOrders(ordersData);
        }
        
        // Get product count
        const { count, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeData.id);
        
        if (!productError && count !== null) {
          setProductCount(count);
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
  
  const storeLink = `shopzap.io/${storeData.username}`;
  
  return (
    <DashboardLayout>
      <div className="container p-4 mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{storeData.name}</h1>
            <p className="text-muted-foreground">Welcome to your store dashboard</p>
          </div>
          <Button onClick={() => navigate('/dashboard/products/new')} className="self-start">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Store Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm flex-1 truncate">
                {storeLink}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(`https://${storeLink}`);
                toast({ title: "Link copied to clipboard" });
              }}>
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <StoreStats 
          productCount={productCount} 
          orderCount={recentOrders.length} 
          plan={storeData.plan} 
        />
        
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.buyer_name}</TableCell>
                      <TableCell>₹{order.total_price}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No orders yet</h3>
                <p className="text-muted-foreground mt-2">
                  Share your store link with customers to start receiving orders
                </p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  navigator.clipboard.writeText(`https://${storeLink}`);
                  toast({ title: "Link copied to clipboard" });
                }}>
                  Copy Store Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard/products')} className="justify-start">
                <Package className="mr-2 h-4 w-4" /> Manage Products
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard/customize')} className="justify-start">
                <Palette className="mr-2 h-4 w-4" /> Customize Theme
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard/settings')} className="justify-start">
                <Settings className="mr-2 h-4 w-4" /> Store Settings
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Your Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {storeData.plan === 'free' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Free Plan</h4>
                      <p className="text-xs text-muted-foreground">Limited features</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    <p className="flex items-center"><span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 text-xs">✓</span> Up to 5 products</p>
                    <p className="flex items-center"><span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 text-xs">✓</span> Basic store theme</p>
                    <p className="flex items-center"><span className="bg-red-100 text-red-800 p-1 rounded-full mr-2 text-xs">✕</span> No CSV imports</p>
                    <p className="flex items-center"><span className="bg-red-100 text-red-800 p-1 rounded-full mr-2 text-xs">✕</span> No custom themes</p>
                  </div>
                  <Button className="w-full" onClick={() => navigate('/pricing')}>
                    Upgrade to Pro
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{storeData.plan.charAt(0).toUpperCase() + storeData.plan.slice(1)} Plan</h4>
                      <p className="text-xs text-muted-foreground">All features unlocked</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    <p className="flex items-center"><span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 text-xs">✓</span> Unlimited products</p>
                    <p className="flex items-center"><span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 text-xs">✓</span> Custom themes</p>
                    <p className="flex items-center"><span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 text-xs">✓</span> CSV imports</p>
                    <p className="flex items-center"><span className="bg-green-100 text-green-800 p-1 rounded-full mr-2 text-xs">✓</span> Advanced analytics</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
