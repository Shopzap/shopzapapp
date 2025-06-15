import React, { useState, useEffect } from 'react';
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
import MultiImageUploader from './MultiImageUploader';
import { Product, ProductVariant } from './types';
import VariantManager from './VariantManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateUniqueProductSlug } from '@/utils/slugHelpers';

interface EditProductFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
  open: boolean;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSuccess, onCancel, open }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(product.is_published ?? true);
  const [images, setImages] = useState<string[]>(
    Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : (product.image_url ? [product.image_url] : [])
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [initialVariants, setInitialVariants] = useState<ProductVariant[]>([]);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      status: product.status,
      payment_method: product.payment_method || 'online',
      category: product.category || ''
    }
  });

  const productType = product.product_type || 'simple';

  useEffect(() => {
    if (productType === 'variant') {
      supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching variants:", error);
            toast({ title: "Error fetching variants", variant: "destructive" });
          } else {
            const fetchedVariants = (data || []).map(v => ({
              ...v,
              options: (typeof v.options === 'object' && v.options && !Array.isArray(v.options) ? v.options : {}) as { [key: string]: string }
            }));
            setVariants(fetchedVariants);
            setInitialVariants(fetchedVariants);
          }
        });
    }
  }, [product, productType, toast]);

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

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log('Starting product update process...');
      
      if (images.length === 0 && newFiles.length === 0) {
        toast({
          title: "Images required",
          description: "Please add at least one product image",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (productType === 'variant' && variants.length === 0) {
        toast({
            title: "Variants required",
            description: "A product with variants must have at least one variant defined.",
            variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Get user's session
      console.log('Getting user session...');
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({
          title: "Authentication error",
          description: "Please try logging in again",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!session.session?.user) {
        console.error('No authenticated user found');
        toast({
          title: "Authentication required",
          description: "Please login to update products",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log('User authenticated:', session.session.user.id);

      // Get user's store
      console.log('Fetching store data...');
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, username')
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      if (storeError) {
        console.error('Store fetch error:', storeError);
        toast({
          title: "Error fetching store",
          description: "Unable to access store information",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!storeData) {
        console.error('No store found for user');
        toast({
          title: "Store not found",
          description: "Please complete the onboarding process",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Store found:', storeData.id);

      // Upload new images
      let finalImages = [...images];
      if (newFiles.length > 0) {
        console.log('Uploading new images...');
        try {
          const uploadedUrls = await uploadImages(newFiles, storeData.id);
          finalImages = [...finalImages, ...uploadedUrls];
          console.log('Images uploaded successfully');
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image upload failed",
            description: "Please try again with smaller images",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log('Preparing product update...');
      const updatePayload: { [key: string]: any } = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        status: data.status,
        payment_method: data.payment_method,
        is_published: isPublished,
        images: finalImages,
        image_url: finalImages[0] || null,
        updated_at: new Date().toISOString(),
        category: data.category,
        inventory_count: productType === 'simple'
          ? product.inventory_count // This should come from a form field if editable for simple products
          : variants.reduce((acc, v) => acc + (v.inventory_count || 0), 0),
      };
      
      // Regenerate slug if product name changes
      if (data.name !== product.name) {
        if (!storeData?.username) {
          toast({
            title: "Error",
            description: "Could not find store username to generate slug.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        console.log("Product name changed, regenerating slug...");
        updatePayload.slug = await generateUniqueProductSlug(
          storeData.username,
          data.name,
          supabase,
          product.id
        );
        console.log("New slug:", updatePayload.slug);
      }

      console.log('Updating product in database...');
      const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', product.id);
        
      if (error) {
        console.error('Product update error:', error);
        throw error;
      }
      
      if (productType === 'variant') {
        console.log('Upserting variants...');

        const variantsToCreate = variants.filter(v => !v.id);
        const variantsToUpdate = variants.filter(v => v.id) as (ProductVariant & { id: string })[];

        const initialVariantIds = initialVariants.map(v => v.id).filter(id => !!id);
        const currentVariantIds = variantsToUpdate.map(v => v.id);
        const variantIdsToDelete = initialVariantIds.filter(id => id && !currentVariantIds.includes(id));
        
        // CREATE new variants
        if (variantsToCreate.length > 0) {
          const newVariantData = variantsToCreate.map(({ id, ...v }) => ({
            ...v,
            product_id: product.id,
          }));
          const { error: createError } = await supabase.from('product_variants').insert(newVariantData);
          if (createError) {
            console.error('Error creating variants:', createError);
            throw createError;
          }
          console.log('Created variants:', variantsToCreate.length);
        }

        // UPDATE existing variants
        if (variantsToUpdate.length > 0) {
          for (const variant of variantsToUpdate) {
            const { id, product_id, created_at, updated_at, ...updateData } = variant;
            const { error: updateError } = await supabase
              .from('product_variants')
              .update(updateData)
              .eq('id', id);
            if (updateError) {
              console.error(`Error updating variant ${id}:`, updateError);
              throw updateError;
            }
          }
          console.log('Updated variants:', variantsToUpdate.length);
        }

        // DELETE removed variants
        if (variantIdsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('product_variants')
            .delete()
            .in('id', variantIdsToDelete);
          if (deleteError) {
            console.error('Error deleting variants:', deleteError);
            throw deleteError;
          }
          console.log('Deleted variants:', variantIdsToDelete.length);
        }
      }

      console.log('Product updated successfully');
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
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <div className="p-1 pr-3 space-y-6 max-h-[70vh] overflow-y-auto">
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
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch('category') || ''}
                onValueChange={(value: string) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                  <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Toys & Games">Toys & Games</SelectItem>
                  <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">
                {productType === 'variant' ? 'Default Price (₹)' : 'Price (₹)'}
              </Label>
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
              {productType === 'variant' && <p className="text-xs text-muted-foreground mt-1">Used as a base price for new variants.</p>}
            </div>

            <MultiImageUploader
              images={images}
              onImagesChange={setImages}
              onFilesChange={setNewFiles}
              disabled={isSubmitting}
            />

            {productType === 'variant' && (
                <VariantManager 
                    initialVariants={variants} 
                    onVariantsChange={setVariants} 
                    basePrice={watch('price')}
                />
            )}

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
      </DialogContent>
    </Dialog>
  );
};

export default EditProductForm;
