import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import MultiImageUploader from './MultiImageUploader';
import { ProductVariant } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from 'react-hook-form';
import { useProductFormPersistence } from '@/hooks/useProductFormPersistence';

interface AddProductModalProps {
  onProductAdded: () => void;
  disabled?: boolean;
  title?: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  inventory_count: string;
  payment_method: string;
  category: string;
  product_type: 'simple' | 'variant';
}

interface VariantOption {
  name: string;
  values: string[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ 
  onProductAdded, 
  disabled = false, 
  title = "Add a new product" 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { storeData } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVariantPreview, setShowVariantPreview] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([
    { name: 'Size', values: [] },
    { name: 'Color', values: [] }
  ]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      inventory_count: '10',
      payment_method: 'cod',
      category: '',
      product_type: 'simple'
    }
  });

  const formData = watch();
  const productType = watch('product_type');

  // Track form changes for persistence
  useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (name) {
        setIsFormDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Use persistence hook
  const { clearDraft, saveDraft } = useProductFormPersistence({
    formData: {
      ...formData,
      variants,
      variantOptions,
      imageUrls,
      showVariantPreview
    },
    isFormDirty,
    storeId: storeData?.id,
    onRestoreDraft: (draftData) => {
      // Restore form data
      Object.keys(draftData).forEach(key => {
        if (key in formData) {
          setValue(key as keyof FormData, draftData[key]);
        }
      });
      
      // Restore variants and other state
      if (draftData.variants) setVariants(draftData.variants);
      if (draftData.variantOptions) setVariantOptions(draftData.variantOptions);
      if (draftData.imageUrls) setImageUrls(draftData.imageUrls);
      if (draftData.showVariantPreview) setShowVariantPreview(draftData.showVariantPreview);
      
      setIsFormDirty(true);
    }
  });

  // Auto-save draft periodically
  useEffect(() => {
    if (isFormDirty && isOpen) {
      const autoSaveInterval = setInterval(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [isFormDirty, isOpen, saveDraft]);

  const handleImagesChange = (images: string[]) => {
    setImageUrls(images);
  };

  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const generateSKU = (productName: string, variant?: ProductVariant) => {
    const baseCode = productName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    
    if (variant && variant.options) {
      const variantCode = Object.values(variant.options).join('-').substring(0, 6).toUpperCase();
      return `${baseCode}-${variantCode}-${timestamp}`;
    }
    
    return `${baseCode}-${timestamp}`;
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const file of imageFiles) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${storeData?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return uploadedUrls;
  };

  const addVariantOption = (optionName: string) => {
    const value = prompt(`Enter ${optionName} value:`);
    if (value && value.trim()) {
      setVariantOptions(prev => 
        prev.map(option => 
          option.name === optionName 
            ? { ...option, values: [...option.values, value.trim()] }
            : option
        )
      );
      generateVariants();
    }
  };

  const removeVariantValue = (optionName: string, valueIndex: number) => {
    setVariantOptions(prev => 
      prev.map(option => 
        option.name === optionName 
          ? { ...option, values: option.values.filter((_, index) => index !== valueIndex) }
          : option
      )
    );
    generateVariants();
  };

  const generateVariants = () => {
    const activeOptions = variantOptions.filter(option => option.values.length > 0);
    
    if (activeOptions.length === 0) {
      setVariants([]);
      return;
    }

    const combinations: ProductVariant[] = [];
    const generateCombinations = (optionIndex: number, currentOptions: Record<string, string>) => {
      if (optionIndex === activeOptions.length) {
        combinations.push({
          price: 0,
          inventory_count: 0,
          options: { ...currentOptions },
          sku: '',
          image_url: ''
        });
        return;
      }

      const option = activeOptions[optionIndex];
      option.values.forEach(value => {
        generateCombinations(optionIndex + 1, {
          ...currentOptions,
          [option.name]: value
        });
      });
    };

    generateCombinations(0, {});
    setVariants(combinations);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants(prev => 
      prev.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const validateVariants = (): boolean => {
    if (productType === 'variant' && variants.length === 0) {
      toast({
        title: "Variants required",
        description: "Please create at least one product variant",
        variant: "destructive"
      });
      return false;
    }

    if (productType === 'variant') {
      for (const variant of variants) {
        if (!variant.price || variant.price <= 0) {
          toast({
            title: "Invalid variant price",
            description: "All variants must have a valid price",
            variant: "destructive"
          });
          return false;
        }
        if (variant.inventory_count < 0) {
          toast({
            title: "Invalid inventory",
            description: "Variant inventory cannot be negative",
            variant: "destructive"
          });
          return false;
        }
      }
    }

    return true;
  };

  const onSubmit = async (formData: FormData) => {
    if (!user || !storeData) {
      toast({
        title: "Error",
        description: "You must be logged in with a store to add products",
        variant: "destructive"
      });
      return;
    }

    if (imageUrls.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one product image",
        variant: "destructive"
      });
      return;
    }

    if (!validateVariants()) {
      return;
    }

    setIsLoading(true);

    try {
      const slug = generateSlug(formData.name);
      
      // Upload images first
      const uploadedImageUrls = await uploadImages();
      const allImageUrls = [...uploadedImageUrls];
      
      // Base product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.product_type === 'simple' ? parseFloat(formData.price) || 0 : 0,
        image_url: allImageUrls[0] || '', // First image as main image
        images: allImageUrls.slice(1), // Rest as additional images
        payment_method: formData.payment_method,
        store_id: storeData.id,
        user_id: user.id,
        status: 'active',
        category: formData.category,
        inventory_count: formData.product_type === 'simple' ? parseInt(formData.inventory_count) || 0 : 0,
        slug: slug,
        is_published: true,
        product_type: formData.product_type
      };

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) throw productError;

      // Insert variants if product type is variant
      if (formData.product_type === 'variant' && variants.length > 0) {
        const variantData = variants.map(variant => ({
          product_id: product.id,
          price: variant.price,
          inventory_count: variant.inventory_count,
          sku: variant.sku || generateSKU(formData.name, variant),
          image_url: variant.image_url || allImageUrls[0] || '',
          options: variant.options
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantData);

        if (variantError) throw variantError;
      }

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      // Clear draft and reset form
      clearDraft();
      reset();
      setVariants([]);
      setImageFiles([]);
      setImageUrls([]);
      setShowVariantPreview(false);
      setVariantOptions([
        { name: 'Size', values: [] },
        { name: 'Color', values: [] }
      ]);
      setIsFormDirty(false);

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

  // Handle modal close with draft save
  const handleModalClose = () => {
    if (isFormDirty) {
      saveDraft();
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved and will be restored when you return.",
        duration: 3000,
      });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add New Product
            {isFormDirty && (
              <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                Draft Saved
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Product name is required' })}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Select 
                  value={productType} 
                  onValueChange={(value) => setValue('product_type', value as 'simple' | 'variant')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple Product</SelectItem>
                    <SelectItem value="variant">Product with Variants</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={(value) => setValue('category', value)}
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {productType === 'simple' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register('price', { required: 'Price is required' })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory">Inventory</Label>
                    <Input
                      id="inventory"
                      type="number"
                      {...register('inventory_count')}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  onValueChange={(value) => setValue('payment_method', value)}
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
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <MultiImageUploader
                images={imageUrls}
                onImagesChange={handleImagesChange}
                onFilesChange={handleFilesChange}
                maxImages={5}
              />
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              {productType === 'variant' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Variants</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVariantPreview(!showVariantPreview)}
                    >
                      {showVariantPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                      {showVariantPreview ? 'Hide Preview' : 'Preview Combinations'}
                    </Button>
                  </div>
                  
                  {/* Variant Options Management */}
                  <div className="space-y-4">
                    {variantOptions.map((option, optionIndex) => (
                      <div key={option.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{option.name}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVariantOption(option.name)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add {option.name}
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {option.values.map((value, valueIndex) => (
                            <div key={value} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                              <span>{value}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => removeVariantValue(option.name, valueIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Variant Combinations */}
                  {variants.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Variant Details ({variants.length} combinations)</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {variants.map((variant, index) => (
                          <div key={index} className="border rounded-lg p-3 space-y-3">
                            <div className="font-medium text-sm">
                              {Object.entries(variant.options).map(([key, value]) => `${key}: ${value}`).join(' / ')}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">Price (₹)</Label>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  value={variant.price || ''}
                                  onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-xs">Stock</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  value={variant.inventory_count || ''}
                                  onChange={(e) => updateVariant(index, 'inventory_count', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-xs">SKU</Label>
                                <Input
                                  placeholder="Auto-generated"
                                  value={variant.sku || ''}
                                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showVariantPreview && variants.length > 0 && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-3">Variant Preview ({variants.length} combinations)</h4>
                      <div className="grid gap-2 max-h-40 overflow-y-auto">
                        {variants.map((variant, index) => (
                          <div key={index} className="flex justify-between items-center text-sm p-2 bg-background rounded border">
                            <span>{Object.values(variant.options).join(' / ')}</span>
                            <span>₹{variant.price} | Stock: {variant.inventory_count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Switch to "Product with Variants" to configure variants</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            {isFormDirty && (
              <Button type="button" variant="secondary" onClick={saveDraft}>
                Save Draft
              </Button>
            )}
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
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
