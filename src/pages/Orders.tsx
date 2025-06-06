
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/utils/priceUtils';
import BulkOrderActions from '@/components/orders/BulkOrderActions';

const Orders = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [storeData, setStoreData] = useState<any>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user) {
        navigate('/auth');
        return;
      }
      
      const userId = sessionData.session.user.id;
      
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
      
      let query = supabase
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
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter.toLowerCase());
      }

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: "Error loading orders",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      toast({
        title: "Error loading orders",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductNames = (orderItems: any[]) => {
    if (!orderItems || orderItems.length === 0) return 'No products';
    
    const productNames = orderItems
      .map(item => item.products?.name || 'Unknown Product')
      .join(', ');
    
    return productNames.length > 50 ? productNames.substring(0, 50) + '...' : productNames;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleBulkStatusUpdate = (orderIds: string[], newStatus: string) => {
    // Update local state
    setOrders(prev => prev.map(order => 
      orderIds.includes(order.id) 
        ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
        : order
    ));
    
    // Mark as recently updated for highlighting
    setRecentlyUpdated(orderIds);
    setTimeout(() => setRecentlyUpdated([]), 3000);
  };

  const handleClearSelection = () => {
    setSelectedOrders([]);
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BulkOrderActions
        selectedOrders={selectedOrders}
        onStatusUpdate={handleBulkStatusUpdate}
        onClearSelection={handleClearSelection}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'All' ? 'All Orders' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
            {orders.length > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">({orders.length})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'All' 
                  ? "You haven't received any orders yet. Share your store link to start receiving orders!"
                  : `No ${statusFilter.toLowerCase()} orders found.`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all orders"
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order.id}
                      className={recentlyUpdated.includes(order.id) ? 'bg-green-50 border-green-200' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          aria-label={`Select order ${order.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        #{order.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyer_name}</p>
                          {order.buyer_phone && (
                            <p className="text-sm text-muted-foreground">{order.buyer_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={getProductNames(order.order_items)}>
                            {getProductNames(order.order_items)}
                          </p>
                          {order.order_items && order.order_items.length > 1 && (
                            <p className="text-xs text-muted-foreground">
                              +{order.order_items.length - 1} more
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₹{formatPrice(Number(order.total_price))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
