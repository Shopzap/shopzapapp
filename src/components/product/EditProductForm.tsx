
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uuid } from '@/lib/utils';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  sku?: string;
  inventory_count?: number;
  status: string;
};

interface EditProductFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ 
  product,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price.toString());
  const [status, setStatus] = useState(product.status);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Starting product update...');
    console.log('Form data:', { name, price, description, status });
    
    // Validate required fields
    if (!name || !price) {
      toast({
        title: 'Missing required fields',
        description: 'Product name and price are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the user's store ID for image path
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: 'Authentication required',
          description: 'Please login to update products',
          variant: 'destructive'
        });
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (storeError || !storeData) {
        toast({
          title: 'Store not found',
          description: 'Please complete the onboarding process',
          variant: 'destructive'
        });
        return;
      }

      let imageUrl = product.image_url;

      // Upload new image if available
      if (imageFile) {
        console.log('Uploading new image...');
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${storeData.id}/${uuid()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          // Don't fail the entire process for image upload issues
          console.warn('Continuing without image due to upload error');
        } else {
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);
          
          imageUrl = publicUrl;
          console.log('Image uploaded successfully:', imageUrl);
        }
      }

      // Update product data - only include fields that exist in the database schema
      const updateData = {
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        status,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      console.log('Updating product with data:', updateData);

      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);

      if (updateError) {
        console.error('Product update error:', updateError);
        throw updateError;
      }

      console.log('Product updated successfully!');

      toast({
        title: 'Product updated',
        description: 'Your product has been updated successfully',
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error updating product',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input 
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-image">Product Image</Label>
            <div className="mt-1 flex items-center">
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label 
                htmlFor="edit-image" 
                className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 w-full"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-32 object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Click to upload an image</p>
                  </div>
                )}
              </Label>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
