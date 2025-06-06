
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkOrderActionsProps {
  selectedOrders: string[];
  onStatusUpdate: (orderIds: string[], newStatus: string) => void;
  onClearSelection: () => void;
}

const BulkOrderActions: React.FC<BulkOrderActionsProps> = ({
  selectedOrders,
  onStatusUpdate,
  onClearSelection
}) => {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleBulkUpdate = async () => {
    if (!selectedStatus || selectedOrders.length === 0) {
      toast({
        title: "Invalid selection",
        description: "Please select a status and at least one order",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: selectedStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedOrders);

      if (error) throw error;

      toast({
        title: "Orders updated successfully",
        description: `${selectedOrders.length} order(s) updated to ${selectedStatus}`,
      });

      onStatusUpdate(selectedOrders, selectedStatus);
      onClearSelection();
      setSelectedStatus('');
    } catch (error) {
      console.error('Error updating orders:', error);
      toast({
        title: "Error updating orders",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (selectedOrders.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <Package className="h-5 w-5 text-muted-foreground" />
      <Badge variant="secondary">
        {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
      </Badge>
      
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select new status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={handleBulkUpdate}
        disabled={!selectedStatus || isUpdating}
        size="sm"
      >
        {isUpdating ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Bulk Update Status'
        )}
      </Button>

      <Button 
        variant="outline" 
        size="sm"
        onClick={onClearSelection}
      >
        Clear Selection
      </Button>
    </div>
  );
};

export default BulkOrderActions;
