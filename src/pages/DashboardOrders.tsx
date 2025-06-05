
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Search, Filter, Calendar } from 'lucide-react';
import { formatPrice } from '@/utils/priceUtils';

interface Order {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  total_price: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      id: string;
      name: string;
      image_url: string;
    };
  }[];
}

const DashboardOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    fetchStoreAndOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  const fetchStoreAndOrders = async () => {
    try {
      setLoading(true);
      
      // Get current user's store
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) return;

      const userId = sessionData.session.user.id;
      
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (storeError || !store) {
        toast({
          title: "Store not found",
          description: "Please complete seller onboarding first",
          variant: "destructive"
        });
        return;
      }

      setStoreData(store);

      // Fetch orders for this store with order items and product details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: "Error loading orders",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
        return;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong while loading orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term (buyer name, email, or phone)
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_phone?.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage your store orders</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {orders.length} Total Orders
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 
                ? "When customers place orders, they will appear here."
                : "No orders match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Order Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{order.buyer_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.id.slice(0, 8)}...
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Email:</strong> {order.buyer_email || 'Not provided'}</p>
                        <p><strong>Phone:</strong> {order.buyer_phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong> {order.buyer_address || 'Not provided'}</p>
                        <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-2">Items Ordered:</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <img 
                              src={item.products.image_url || '/placeholder.svg'} 
                              alt={item.products.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.products.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ₹{formatPrice(item.price_at_purchase)}
                              </p>
                            </div>
                            <p className="font-medium">
                              ₹{formatPrice(item.quantity * item.price_at_purchase)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-lg font-bold">
                        Total: ₹{formatPrice(order.total_price)}
                      </p>
                      
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          >
                            Confirm Order
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                          >
                            Mark as Shipped
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                          >
                            Mark as Delivered
                          </Button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardOrders;
