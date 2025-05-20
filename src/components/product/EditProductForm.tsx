
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { X, Loader2, ImagePlus } from 'lucide-react';

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
  const [category, setCategory] = useState(product.category || '');
  const [sku, setSku] = useState(product.sku || '');
  const [inventoryCount, setInventoryCount] = useState(
    product.inventory_count !== undefined ? product.inventory_count.toString() : ''
  );
  const [status, setStatus] = useState(product.status);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
    setIsImageRemoved(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsImageRemoved(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = isImageRemoved ? null : product.image_url;

      // Upload new image if provided
      if (imageFile) {
        const { data: session } = await supabase.auth.getSession();
        const { data: storeData } = await supabase
          .from('products')
          .select('store_id')
          .eq('id', product.id)
          .single();
          
        if (!storeData) {
          throw new Error("Could not find product's store");
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${storeData.store_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Update product in database
      const { error } = await supabase
        .from('products')
        .update({
          name,
          description: description || null,
          price: parseFloat(price) || 0,
          category: category || null,
          sku: sku || null,
          inventory_count: inventoryCount ? parseInt(inventoryCount) : null,
          status,
          image_url: imageUrl,
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Product updated",
        description: "Your product has been updated successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error updating product",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name" className="text-sm font-medium">
              Product Name*
            </Label>
            <Input 
              id="edit-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea 
              id="edit-description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="edit-price" className="text-sm font-medium">
              Price*
            </Label>
            <Input 
              id="edit-price" 
              type="number" 
              min="0" 
              step="0.01" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-image" className="text-sm font-medium">
              Product Image
            </Label>
            {!imagePreview ? (
              <div className="mt-1 border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label 
                  htmlFor="edit-image" 
                  className="mt-4 btn-hover inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2"
                >
                  Select Image
                </label>
              </div>
            ) : (
              <div className="relative mt-1 h-[200px] rounded-md overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="w-full h-full object-contain" 
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-category" className="text-sm font-medium">
                Category
              </Label>
              <Input 
                id="edit-category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
              />
            </div>
            
            <div>
              <Label htmlFor="edit-sku" className="text-sm font-medium">
                SKU
              </Label>
              <Input 
                id="edit-sku" 
                value={sku} 
                onChange={(e) => setSku(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-inventory" className="text-sm font-medium">
                Inventory
              </Label>
              <Input 
                id="edit-inventory" 
                type="number" 
                min="0" 
                step="1" 
                value={inventoryCount} 
                onChange={(e) => setInventoryCount(e.target.value)} 
              />
            </div>
            
            <div>
              <Label htmlFor="edit-status" className="text-sm font-medium">
                Status
              </Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
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
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Product'
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
