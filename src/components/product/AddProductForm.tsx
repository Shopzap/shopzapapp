
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader, Plus, X } from 'lucide-react';
import MultiImageUploader from './MultiImageUploader';

interface ProductVariation {
  id?: string;
  options: { [key: string]: string };
  price: number;
  inventory_count: number;
  sku?: string;
  image_url?: string;
}

interface AddProductFormProps {
  onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [productType, setProductType] = useState<'simple' | 'variant'>('simple');
  const [images, setImages] = useState<string[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inventory_count: '10',
    category: '',
    sku: ''
  });

  const [variations, setVariations] = useState<ProductVariation[]>([
    { options: { Size: 'Small', Color: 'Red' }, price: 0, inventory_count: 10 }
  ]);

  const [variationOptions, setVariationOptions] = useState({
    attributes: ['Size', 'Color'],
    values: {
      Size: ['Small', 'Medium', 'Large'],
      Color: ['Red', 'Blue', 'Green']
    }
  });

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add products",
        variant: "destructive"
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one product image",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get user's store
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!storeData) {
        throw new Error('Store not found. Please complete onboarding first.');
      }

      // Upload new files if any
      let finalImageUrls = [...images];
      if (uploadFiles.length > 0) {
        const newUrls = await handleImageUpload(uploadFiles);
        finalImageUrls = [...finalImageUrls, ...newUrls];
      }

      // Generate slug from name
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

      const productData = {
        name: formData.name,
        description: formData.description,
        price: productType === 'simple' ? parseFloat(formData.price) || 0 : 0,
        image_url: finalImageUrls[0],
        images: finalImageUrls,
        store_id: storeData.id,
        status: 'active',
        category: formData.category,
        inventory_count: productType === 'simple' ? parseInt(formData.inventory_count) || 0 : 0,
        slug: slug,
        product_type: productType,
        is_published: true
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      // If variant product, create variations
      if (productType === 'variant' && product) {
        const variationData = variations.map(variation => ({
          product_id: product.id,
          price: variation.price,
          inventory_count: variation.inventory_count,
          sku: variation.sku || '',
          image_url: variation.image_url || finalImageUrls[0],
          options: variation.options
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variationData);

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
        category: '',
        sku: ''
      });
      setImages([]);
      setUploadFiles([]);
      setVariations([{ options: { Size: 'Small', Color: 'Red' }, price: 0, inventory_count: 10 }]);

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

  const addVariation = () => {
    setVariations([...variations, { 
      options: { Size: 'Small', Color: 'Red' }, 
      price: 0, 
      inventory_count: 10 
    }]);
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    setVariations(updated);
  };

  const removeVariation = (index: number) => {
    if (variations.length > 1) {
      setVariations(variations.filter((_, i) => i !== index));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Type Selection */}
          <div className="space-y-2">
            <Label>Product Type</Label>
            <Tabs value={productType} onValueChange={(value) => setProductType(value as 'simple' | 'variant')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple">Simple Product</TabsTrigger>
                <TabsTrigger value="variant">Product with Variations</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Basic Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Product Images */}
          <MultiImageUploader
            images={images}
            onImagesChange={setImages}
            onFilesChange={setUploadFiles}
            disabled={isLoading}
          />

          {/* Simple Product Fields */}
          {productType === 'simple' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Product SKU"
                />
              </div>
            </div>
          )}

          {/* Variation Product Fields */}
          {productType === 'variant' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Product Variations</h3>
                <Button type="button" onClick={addVariation} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variation
                </Button>
              </div>

              {variations.map((variation, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Variation {index + 1}</h4>
                    {variations.length > 1 && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeVariation(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select
                        value={variation.options.Size || ''}
                        onValueChange={(value) => updateVariation(index, 'options', { ...variation.options, Size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="Small">Small</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Large">Large</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select
                        value={variation.options.Color || ''}
                        onValueChange={(value) => updateVariation(index, 'options', { ...variation.options, Color: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Red">Red</SelectItem>
                          <SelectItem value="Blue">Blue</SelectItem>
                          <SelectItem value="Green">Green</SelectItem>
                          <SelectItem value="Black">Black</SelectItem>
                          <SelectItem value="White">White</SelectItem>
                          <SelectItem value="Yellow">Yellow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        value={variation.price}
                        onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Inventory</Label>
                      <Input
                        type="number"
                        value={variation.inventory_count}
                        onChange={(e) => updateVariation(index, 'inventory_count', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding Product...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProductForm;
