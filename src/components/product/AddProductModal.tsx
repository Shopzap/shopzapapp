
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
import MultiImageUploader from './MultiImageUploader';

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
  const [isPublished, setIsPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      status: 'active',
      payment_method: 'online'
    }
  });

  const uploadImages = async (files: File[], storeId: string): Promise<string[]> => {
    console.log('Uploading images for store:', storeId);
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${storeId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  // Function to generate slug from product name
  const generateSlug = (name: string, counter?: number): string => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    return counter ? `${baseSlug}-${counter}` : baseSlug;
  };

  // Function to check if slug exists and generate unique one
  const getUniqueSlug = async (name: string, storeId: string): Promise<string> => {
    let slug = generateSlug(name);
    let counter = 1;
    
    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) {
        return slug;
      }
      
      counter++;
      slug = generateSlug(name, counter);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log('Starting product creation process...');
      
      if (newFiles.length === 0) {
        toast({
          title: "Images required",
          description: "Please add at least one product image",
          variant: "destructive"
        });
        return;
      }
      
      // Get store ID if not provided
      let currentStoreId = storeId;
      if (!currentStoreId) {
        console.log('Getting user session...');
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: "Authentication error",
            description: "Please try logging in again",
            variant: "destructive"
          });
          return;
        }

        if (!session.session?.user) {
          console.error('No authenticated user found');
          toast({
            title: "Authentication required",
            description: "Please login to add products",
            variant: "destructive"
          });
          return;
        }

        console.log('User authenticated:', session.session.user.id);

        console.log('Fetching store data...');
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('user_id', session.session.user.id)
          .maybeSingle();

        if (storeError) {
          console.error('Store fetch error:', storeError);
          toast({
            title: "Error fetching store",
            description: "Unable to access store information",
            variant: "destructive"
          });
          return;
        }

        if (!storeData) {
          console.error('No store found for user');
          toast({
            title: "Store not found",
            description: "Please complete the onboarding process",
            variant: "destructive"
          });
          return;
        }
        
        currentStoreId = storeData.id;
        console.log('Store found:', currentStoreId);
      }

      // Generate unique slug
      console.log('Generating unique slug...');
      const slug = await getUniqueSlug(data.name, currentStoreId);
      console.log('Generated slug:', slug);

      // Upload images
      console.log('Uploading images...');
      let uploadedImages: string[] = [];
      try {
        uploadedImages = await uploadImages(newFiles, currentStoreId);
        console.log('Images uploaded successfully');
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        toast({
          title: "Image upload failed",
          description: "Please try again with smaller images",
          variant: "destructive"
        });
        return;
      }
      
      // Insert product with images array and slug
      console.log('Creating product in database...');
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          status: data.status,
          payment_method: data.payment_method,
          store_id: currentStoreId,
          is_published: isPublished,
          images: uploadedImages,
          image_url: uploadedImages[0] || null,
          slug: slug
        });
        
      if (error) {
        console.error('Product creation error:', error);
        throw error;
      }
      
      console.log('Product created successfully');
      toast({ title: "Product added successfully!" });
      reset();
      setIsPublished(true);
      setImages([]);
      setNewFiles([]);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
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

            <MultiImageUploader
              images={images}
              onImagesChange={setImages}
              onFilesChange={setNewFiles}
              disabled={isSubmitting}
            />

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
