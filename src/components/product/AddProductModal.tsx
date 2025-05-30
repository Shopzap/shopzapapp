
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uuid } from '@/lib/utils';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const categories = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Books',
  'Toys & Games',
  'Sports & Outdoors',
  'Other'
];

const AddProductModal: React.FC<AddProductModalProps> = ({ 
  open, 
  onClose,
  onProductAdded
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [inventoryCount, setInventoryCount] = useState('');
  const [status, setStatus] = useState('active');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setSku('');
    setInventoryCount('');
    setStatus('active');
    setPaymentMethod('');
    setImageFile(null);
    setImagePreview(null);
  };

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
    
    console.log('Starting product submission...');
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
      console.log('Getting user session...');

      // First get the user's session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get user session');
      }

      if (!session.session) {
        console.error('No active session found');
        toast({
          title: 'Authentication required',
          description: 'Please login to add products',
          variant: 'destructive'
        });
        return;
      }

      console.log('User ID:', session.session.user.id);

      // Get the user's store
      console.log('Fetching store data...');
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (storeError) {
        console.error('Store fetch error:', storeError);
        toast({
          title: 'Store not found',
          description: 'Please complete the onboarding process',
          variant: 'destructive'
        });
        return;
      }

      if (!storeData) {
        console.error('No store found for user');
        toast({
          title: 'Store not found',
          description: 'Please complete the onboarding process',
          variant: 'destructive'
        });
        return;
      }

      console.log('Store ID:', storeData.id);

      let imageUrl = null;

      // Upload image if available
      if (imageFile) {
        console.log('Uploading image...');
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

      // Prepare product data - only include fields that exist in the database schema
      const productData = {
        store_id: storeData.id,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        status,
        payment_method: paymentMethod,
        image_url: imageUrl
      };

      console.log('Inserting product with data:', productData);

      // Insert product data
      const { error: insertError } = await supabase
        .from('products')
        .insert(productData);

      if (insertError) {
        console.error('Product insert error:', insertError);
        throw insertError;
      }

      console.log('Product added successfully!');

      toast({
        title: 'Product added successfully!',
        description: 'Your product has been added to your store',
      });

      resetForm();
      onProductAdded();
      onClose();

    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error adding product',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
        if (!isSubmitting) resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="online">Only Online Payment</option>
                  <option value="cod">Only Cash on Delivery</option>
                  <option value="both">Online & COD</option>
                </select>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="image" 
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
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="image">Product Image</Label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="image" 
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
              onClick={() => {
                onClose();
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
