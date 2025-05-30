
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3"
              required
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">
              SKU
            </Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inventoryCount" className="text-right">
              Inventory Count
            </Label>
            <Input
              id="inventoryCount"
              type="number"
              value={inventoryCount}
              onChange={(e) => setInventoryCount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">
              Payment Method
            </Label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="col-span-3 p-2 border rounded-md"
            >
              <option value="online">Only Online Payment</option>
              <option value="cod">Only Cash on Delivery</option>
              <option value="both">Online & COD</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Product Image
            </Label>
            <Input
              id="image"
              type="file"
              onChange={handleImageChange}
              className="col-span-3"
              accept="image/*"
            />
          </div>
          {imagePreview && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1"></div>
              <div className="col-span-3">
                <img src={imagePreview} alt="Product Preview" className="max-w-full h-auto rounded-md" />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
