
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  images?: string[];
  category?: string;
  inventory_count?: number;
  status: string;
  product_type: 'simple' | 'variant';
  store_id: string;
}

interface ProductVariant {
  id: string;
  price: number;
  inventory_count: number;
  sku?: string;
  image_url?: string;
  options: { [key: string]: string };
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Product ID not found",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      try {
        console.log('Fetching product with ID:', id);
        
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .single();

        if (productError) {
          console.error('Product fetch error:', productError);
          toast({
            title: "Error loading product",
            description: productError.message,
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        if (!productData) {
          console.log('Product not found');
          toast({
            title: "Product not found",
            description: "The product you're looking for doesn't exist or is no longer available.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        console.log('Product found:', productData);
        
        // Type-safe product mapping
        const mappedProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image_url: productData.image_url,
          images: productData.images,
          category: productData.category,
          inventory_count: productData.inventory_count,
          status: productData.status,
          product_type: (productData.product_type === 'variant' || productData.product_type === 'simple') 
            ? productData.product_type 
            : 'simple',
          store_id: productData.store_id
        };
        
        setProduct(mappedProduct);

        // If it's a variant product, fetch variants
        if (mappedProduct.product_type === 'variant') {
          const { data: variantData, error: variantError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', mappedProduct.id);

          if (variantError) {
            console.error('Variants fetch error:', variantError);
          } else {
            console.log('Variants found:', variantData);
            
            // Type-safe variant mapping
            const mappedVariants: ProductVariant[] = (variantData || []).map(variant => ({
              id: variant.id,
              price: variant.price,
              inventory_count: variant.inventory_count,
              sku: variant.sku,
              image_url: variant.image_url,
              options: typeof variant.options === 'object' && variant.options !== null 
                ? variant.options as { [key: string]: string }
                : {}
            }));
            
            setVariants(mappedVariants);
            if (mappedVariants.length > 0) {
              setSelectedVariant(mappedVariants[0]);
              setSelectedOptions(mappedVariants[0].options || {});
            }
          }
        }
      } catch (error: any) {
        console.error('Exception fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const getAvailableOptions = () => {
    const options: { [key: string]: string[] } = {};
    
    variants.forEach(variant => {
      Object.entries(variant.options || {}).forEach(([key, value]) => {
        if (!options[key]) {
          options[key] = [];
        }
        if (!options[key].includes(value)) {
          options[key].push(value);
        }
      });
    });
    
    return options;
  };

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    
    // Find matching variant
    const matchingVariant = variants.find(variant => {
      return Object.entries(newOptions).every(([key, val]) => 
        variant.options?.[key] === val
      );
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    const currentPrice = product.product_type === 'variant' && selectedVariant 
      ? selectedVariant.price 
      : product.price;

    const currentImage = product.product_type === 'variant' && selectedVariant?.image_url
      ? selectedVariant.image_url
      : (product.image_url || (product.images && product.images[0]) || 'https://placehold.co/80x80');

    navigate(`/checkout/${product.id}`, {
      state: {
        product: {
          ...product,
          price: currentPrice,
          image_url: currentImage
        },
        variant: selectedVariant,
        quantity
      }
    });
  };

  const getCurrentPrice = () => {
    if (product?.product_type === 'variant' && selectedVariant) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  };

  const getCurrentStock = () => {
    if (product?.product_type === 'variant' && selectedVariant) {
      return selectedVariant.inventory_count;
    }
    return product?.inventory_count || 0;
  };

  const getCurrentImage = () => {
    if (product?.product_type === 'variant' && selectedVariant?.image_url) {
      return selectedVariant.image_url;
    }
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    return product?.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const availableOptions = getAvailableOptions();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden border">
              <img
                src={getCurrentImage()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-white rounded border overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <Badge variant="secondary" className="mb-4">
                  {product.category}
                </Badge>
              )}
              <p className="text-3xl font-bold text-primary">₹{getCurrentPrice()}</p>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Variant Options */}
            {product.product_type === 'variant' && Object.keys(availableOptions).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Options</h3>
                {Object.entries(availableOptions).map(([optionName, values]) => (
                  <div key={optionName} className="space-y-2">
                    <label className="text-sm font-medium">{optionName}</label>
                    <Select
                      value={selectedOptions[optionName] || ''}
                      onValueChange={(value) => handleOptionChange(optionName, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${optionName}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Stock:</span>
                <Badge variant={getCurrentStock() > 0 ? "default" : "destructive"}>
                  {getCurrentStock() > 0 ? `${getCurrentStock()} available` : 'Out of stock'}
                </Badge>
              </div>
            </div>

            {/* Quantity and Buy Button */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <Select
                  value={quantity.toString()}
                  onValueChange={(value) => setQuantity(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(getCurrentStock(), 10) }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleBuyNow}
                disabled={getCurrentStock() === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now - ₹{getCurrentPrice() * quantity}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
