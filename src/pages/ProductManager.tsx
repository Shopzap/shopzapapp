
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import ProductGrid from '@/components/product/ProductGrid';
import AddProductModal from '@/components/product/AddProductModal';
import CsvUploadModal from '@/components/product/CsvUploadModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
};

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [storePlan, setStorePlan] = useState('free');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchStorePlan();
  }, []);

  const fetchStorePlan = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data } = await supabase
        .from('stores')
        .select('plan')
        .eq('user_id', session.session.user.id)
        .single();

      if (data) {
        setStorePlan(data.plan);
      }
    } catch (error) {
      console.error('Error fetching store plan:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Authentication required",
          description: "Please login to view your products",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // First get the user's store
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (!storeData) {
        toast({
          title: "Store not found",
          description: "Please complete the onboarding process",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Then get products for that store
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading products",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
    setShowAddModal(false);
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

  const handleCsvUploaded = (count: number) => {
    fetchProducts();
    setShowUploadModal(false);
    toast({
      title: "Products imported",
      description: `${count} products have been imported successfully`,
    });
  };

  const isFreePlan = storePlan === 'free';
  const freeProductLimit = 5;
  const isAtProductLimit = isFreePlan && products.length >= freeProductLimit;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddModal(true)}
              disabled={isAtProductLimit}
              title={isAtProductLimit ? "Upgrade your plan to add more products" : "Add a new product"}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
            
            {!isFreePlan && (
              <Button 
                variant="outline"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            )}
          </div>
        </div>
        
        {isFreePlan && (
          <div className="mb-4 p-4 bg-accent/40 rounded-md border border-accent">
            <p className="text-sm">
              Free plan: {products.length}/{freeProductLimit} products used. 
              {isAtProductLimit ? " Upgrade to add more products." : ""}
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or category..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="grid">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
            <ProductGrid 
              products={filteredProducts} 
              isLoading={isLoading} 
              onDelete={handleProductDeleted}
              onUpdate={handleProductUpdated}
            />
          </TabsContent>
          
          <TabsContent value="list">
            <div className="bg-muted p-8 rounded-md text-center">
              <p>List view coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <AddProductModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />
      
      <CsvUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onProductsUploaded={handleCsvUploaded}
      />
    </DashboardLayout>
  );
};

export default ProductManager;
