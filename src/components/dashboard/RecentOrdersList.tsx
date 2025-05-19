
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Order = {
  id: string;
  buyer_name: string;
  total_price: number;
  created_at: string;
  status: string;
};

type RecentOrdersListProps = {
  orders: Order[];
  onCopyStoreLink: () => void;
};

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({ orders, onCopyStoreLink }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-muted-foreground mt-2">
          Share your store link with customers to start receiving orders
        </p>
        <Button variant="outline" className="mt-4" onClick={onCopyStoreLink}>
          Copy Store Link
        </Button>
      </div>
    );
  }

  return (
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
        {orders.map(order => (
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
  );
};

export default RecentOrdersList;
