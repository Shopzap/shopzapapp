import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/types';
import { useAuth } from '../contexts/AuthContext';

type Order = Database['public']['Tables']['orders']['Row'];

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .eq('store_id', user.id) // Assuming user.id is the store_id for the logged-in store
        .order('created_at', { ascending: false });

      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter.toLowerCase());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error.message);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="mb-4">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          id="statusFilter"
          name="statusFilter"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order ID: {order.id.substring(0, 8)}...</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-gray-700 mb-2"><strong>Customer:</strong> {order.buyer_name}</p>
              <p className="text-gray-700 mb-2"><strong>Total Price:</strong> ${order.total_price.toFixed(2)}</p>
              <p className="text-gray-700"><strong>Created:</strong> {new Date(order.created_at || '').toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;