
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import ProductVisibilityToggle from './ProductVisibilityToggle';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: () => void;
  storeId?: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  open,
  onOpenChange,
  onProductAdded,
  storeId
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(true); // Default to published
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image_url: '',
      status: 'active',
      payment_method: 'online'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Get store ID if not provided
      let currentStoreId = storeId;
      if (!currentStoreId) {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          toast({
            title: "Authentication required",
            description: "Please login to add products",
            variant: "destructive"
          });
          return;
        }

        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('user_id', session.session.user.id)
          .single();

        if (!storeData) {
          toast({
            title: "Store not found",
            description: "Please complete the onboarding process",
            variant: "destructive"
          });
          return;
        }
        currentStoreId = storeData.id;
      }
      
      // Insert product with explicit is_published value
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          image_url: data.image_url,
          status: data.status,
          payment_method: data.payment_method,
          store_id: currentStoreId,
          is_published: isPublished // Explicitly set the published status
        });
        
      if (error) throw error;
      
      toast({ title: "Product added successfully!" });
      reset();
      setIsPublished(true); // Reset to default published state
      onOpenChange(false);
      onProductAdded();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error adding product",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Product name is required' })}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                {...register('image_url')}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={watch('status')} 
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select 
                value={watch('payment_method')} 
                onValueChange={(value) => setValue('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ProductVisibilityToggle
              isPublished={isPublished}
              onToggle={setIsPublished}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-600">
              {isPublished 
                ? "This product will be visible to customers in your store" 
                : "This product will be hidden from customers"}
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
