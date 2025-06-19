
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProductGrid from '@/components/product/ProductGrid';
import AddProductModal from '@/components/product/AddProductModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';

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
  created_at?: string;
  store_id: string;
  seller_id?: string;
};

const ProductManager: React.FC = () => {
  useOnboardingRedirect();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching products for user:', user.id);
      
      // First get the user's store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (storeError) {
        console.error('Store fetch error:', storeError);
        toast({
          title: "Error loading store",
          description: storeError.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!storeData) {
        console.log('No store found for user');
        toast({
          title: "Store not found",
          description: "Please complete the onboarding process",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('Store found:', storeData.id);

      // Then get products for that store
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Products fetch error:', productsError);
        toast({
          title: "Error loading products",
          description: productsError.message,
          variant: "destructive"
        });
      } else {
        console.log('Products fetched:', productsData?.length || 0);
        setProducts(productsData || []);
      }
    } catch (error: any) {
      console.error('Exception fetching products:', error);
      toast({
        title: "Error loading products",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleProductAdded = () => {
    fetchProducts();
    toast({
      title: "Product added",
      description: "Your product has been added successfully",
    });
  };

  const handleProductDeleted = () => {
    fetchProducts();
    toast({
      title: "Product deleted",
      description: "Your product has been deleted",
    });
  };

  const handleProductUpdated = () => {
    fetchProducts();
    toast({
      title: "Product updated",
      description: "Your product has been updated successfully",
    });
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
     );
  }

  return (
    <>
      <div className="p-6 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">My Products</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <AddProductModal 
              onProductAdded={handleProductAdded}
              disabled={false}
              title="Add a new product"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {filteredProducts.length === 0 && !isLoading ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No products found. Add your first product!</p>
                  </div>
                ) : (
                  <ProductGrid 
                    products={filteredProducts}
                    isLoading={isLoading}
                    onDelete={handleProductDeleted}
                    onUpdate={handleProductUpdated}
                  />
                )}
              </TabsContent>
              <TabsContent value="active">
                <ProductGrid 
                  products={filteredProducts.filter(p => p.status === 'active')}
                  isLoading={isLoading}
                  onDelete={handleProductDeleted}
                  onUpdate={handleProductUpdated}
                />
              </TabsContent>
              <TabsContent value="draft">
                <ProductGrid 
                  products={filteredProducts.filter(p => p.status === 'draft')}
                  isLoading={isLoading}
                  onDelete={handleProductDeleted}
                  onUpdate={handleProductUpdated}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductManager;
