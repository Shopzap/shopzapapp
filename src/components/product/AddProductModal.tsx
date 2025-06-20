
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { ImageUploader } from './ImageUploader';
import VariantManager from './VariantManager';
import { ProductVariant } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { user } = useAuth();
  const { storeData } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVariantPreview, setShowVariantPreview] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inventory_count: '10',
    payment_method: 'cod',
    category: '',
    image_url: '',
    product_type: 'simple'
  });

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleImageRemoved = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
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

  const validateVariants = (): boolean => {
    if (formData.product_type === 'variant' && variants.length === 0) {
      toast({
        title: "Variants required",
        description: "Please create at least one product variant",
        variant: "destructive"
      });
      return false;
    }

    if (formData.product_type === 'variant') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !storeData) {
      toast({
        title: "Error",
        description: "You must be logged in with a store to add products",
        variant: "destructive"
      });
      return;
    }

    if (!formData.image_url) {
      toast({
        title: "Image required",
        description: "Please upload a product image",
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
      
      // Base product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.product_type === 'simple' ? parseFloat(formData.price) || 0 : 0,
        image_url: formData.image_url,
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
          image_url: variant.image_url || formData.image_url,
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

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        inventory_count: '10',
        payment_method: 'cod',
        category: '',
        image_url: '',
        product_type: 'simple'
      });
      setVariants([]);
      setShowVariantPreview(false);

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

  const handleVariantsChange = (newVariants: ProductVariant[]) => {
    setVariants(newVariants);
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
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
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
                <Label htmlFor="product_type">Product Type</Label>
                <Select 
                  value={formData.product_type} 
                  onValueChange={(value) => setFormData({ ...formData, product_type: value })}
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {formData.product_type === 'simple' && (
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
              )}

              <ImageUploader
                onImageUploaded={handleImageUploaded}
                currentImage={formData.image_url}
                onImageRemoved={handleImageRemoved}
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
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              {formData.product_type === 'variant' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Variants</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVariantPreview(!showVariantPreview)}
                    >
                      {showVariantPreview ? 'Hide Preview' : 'Preview Combinations'}
                    </Button>
                  </div>
                  
                  <VariantManager
                    initialVariants={variants}
                    onVariantsChange={handleVariantsChange}
                    basePrice={formData.price}
                  />

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
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
