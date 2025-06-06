import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import ProductVisibilityToggle from './ProductVisibilityToggle';
import { Product } from './types';

interface EditProductFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(product.is_published ?? true);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      status: product.status,
      payment_method: product.payment_method || 'online'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          image_url: data.image_url,
          status: data.status,
          payment_method: data.payment_method,
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
        
      if (error) throw error;
      
      toast({ title: "Product updated successfully!" });
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error updating product",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
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
            value={watch('status') || 'active'} 
            onValueChange={(value: string) => setValue('status', value)}
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
            value={watch('payment_method') || 'online'} 
            onValueChange={(value: string) => setValue('payment_method', value)}
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
            ? "This product is visible to customers in your store" 
            : "This product is hidden from customers and won't appear in your store"}
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
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
                Updating...
              </>
            ) : (
              'Update Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;
