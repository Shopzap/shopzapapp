import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useStore } from '@/contexts/StoreContext';
import { generateUniqueProductSlug } from '@/utils/slugHelpers';
import { AIDescriptionGenerator } from '@/components/ai/AIDescriptionGenerator';
import { SmartPricingBadge } from '@/components/ai/SmartPricingBadge';
import { AutoProductImport } from '@/components/product/AutoProductImport';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import VariantManager from './VariantManager';
import { ProductVariant } from './types';
import MultiImageUploader from './MultiImageUploader';

interface AddProductModalProps {
  onProductAdded: () => void;
  disabled?: boolean;
  title?: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ 
  onProductAdded, 
  disabled = false, 
  title = "Add a new product" 
}) => {
  const { toast } = useToast();
  const { storeData } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [productType, setProductType] = useState<'simple' | 'variant'>('simple');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inventory_count: '',
    payment_method: 'cod',
    category: ''
  });

  const uploadImages = async (files: File[], storeId: string): Promise<string[]> => {
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

  const validateVariants = (variants: ProductVariant[]): boolean => {
    if (variants.length === 0) return false;
    
    return variants.every(variant => {
      // Check if variant has required fields
      const hasValidPrice = variant.price && parseFloat(variant.price.toString()) > 0;
      const hasValidOptions = variant.options && Object.keys(variant.options).length > 0;
      const hasValidInventory = variant.inventory_count !== undefined && variant.inventory_count >= 0;
      
      return hasValidPrice && hasValidOptions && hasValidInventory;
    });
  };

  const handleProductImport = (importedData: any) => {
    setFormData(prev => ({
      ...prev,
      name: importedData.name,
      description: importedData.description,
      price: importedData.price,
    }));
    if (importedData.image_url) {
      setImages([importedData.image_url]);
    } else {
      setImages([]);
    }
    setNewFiles([]);
  };

  const handleAIDescriptionGenerated = (description: string) => {
    setFormData(prev => ({
      ...prev,
      description
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeData) {
      toast({
        title: "Error",
        description: "Store information not found",
        variant: "destructive"
      });
      return;
    }

    // Enhanced validation for variants
    if (productType === 'variant') {
      if (!validateVariants(variants)) {
        toast({
          title: "Variants incomplete",
          description: "Please ensure all variants have valid price, options, and inventory count.",
          variant: "destructive"
        });
        return;
      }
    }

    if (images.length === 0 && newFiles.length === 0) {
      toast({
        title: "Images required",
        description: "Please add at least one product image",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let finalImages: string[] = [...images];

      // Upload new images if any
      if (newFiles.length > 0) {
        try {
          const uploadedUrls = await uploadImages(newFiles, storeData.id);
          finalImages = [...finalImages, ...uploadedUrls];
        } catch(uploadError) {
          console.error("Error uploading images", uploadError);
          toast({
            title: "Error",
            description: "Failed to upload images. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Generate unique slug for the product
      const slug = await generateUniqueProductSlug(
        storeData.username,
        formData.name,
        supabase
      );

      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        images: finalImages,
        image_url: finalImages[0] || null,
        payment_method: formData.payment_method,
        store_id: storeData.id,
        user_id: storeData.user_id,
        slug: slug,
        status: 'active',
        is_published: true,
        product_type: productType,
        category: formData.category,
        inventory_count: productType === 'simple' 
          ? parseInt(formData.inventory_count) || 0 
          : variants.reduce((acc, v) => acc + (parseInt(v.inventory_count?.toString() || '0') || 0), 0)
      };

      console.log('Creating product with payload:', productPayload);

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (error) {
        console.error('Product creation error:', error);
        throw error;
      }
      
      // Handle variants if it's a variant product
      if (productType === 'variant' && newProduct && variants.length > 0) {
        const variantsPayload = variants.map(variant => ({
          product_id: newProduct.id,
          price: parseFloat(variant.price?.toString() || '0') || 0,
          inventory_count: parseInt(variant.inventory_count?.toString() || '0') || 0,
          sku: variant.sku || `${newProduct.id.slice(0, 8)}-${Object.values(variant.options).join('-').toUpperCase()}`,
          options: variant.options,
          image_url: variant.image_url || finalImages[0] || null
        }));

        console.log('Creating variants with payload:', variantsPayload);

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsPayload);

        if (variantError) {
          console.error('Variant creation error:', variantError);
          throw variantError;
        }
      }

      toast({
        title: "Success",
        description: `Product ${productType === 'variant' ? 'with variants' : ''} added successfully`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        inventory_count: '',
        payment_method: 'cod',
        category: ''
      });
      setImages([]);
      setNewFiles([]);
      setProductType('simple');
      setVariants([]);

      setIsOpen(false);
      onProductAdded();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="import">Import from URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="mt-4">
            <AutoProductImport onProductImported={handleProductImport} />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <AIDescriptionGenerator
                    productName={formData.name}
                    onDescriptionGenerated={handleAIDescriptionGenerated}
                    disabled={!formData.name.trim()}
                  />
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Product Type</Label>
                <RadioGroup 
                  defaultValue="simple" 
                  value={productType}
                  onValueChange={(value: 'simple' | 'variant') => {
                    setProductType(value);
                    if (value === 'simple') {
                      setVariants([]);
                    }
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="simple" id="simple" />
                    <Label htmlFor="simple">Simple Product</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="variant" id="variant" />
                    <Label htmlFor="variant">Product with Variants</Label>
                  </div>
                </RadioGroup>
              </div>

              {productType === 'simple' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <SmartPricingBadge category={formData.category} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory">Inventory</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={formData.inventory_count}
                      onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="price">Default Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">This will be the default price for new variants.</p>
                  </div>
                  <VariantManager 
                    onVariantsChange={setVariants} 
                    basePrice={formData.price}
                    initialVariants={variants}
                  />
                </>
              )}

              <MultiImageUploader
                images={images}
                onImagesChange={setImages}
                onFilesChange={setNewFiles}
                disabled={isLoading}
              />

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
