
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import ProductGrid from '@/components/product/ProductGrid';
import AddProductModal from '@/components/product/AddProductModal';
import CsvUploadModal from '@/components/product/CsvUploadModal';

const ProductManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session?.user) {
          navigate('/auth');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get store data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (storeError || !storeData) {
          toast({
            title: "Store not found",
            description: "Please complete seller onboarding first",
            variant: "destructive"
          });
          navigate('/onboarding');
          return;
        }
        
        setStoreData(storeData);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        
        if (!productsError && productsData) {
          setProducts(productsData);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, toast]);

  const handleProductAdded = () => {
    // Refresh products list
    window.location.reload();
  };

  const handleProductDeleted = () => {
    // Refresh products list
    window.location.reload();
  };

  const handleProductUpdated = () => {
    // Refresh products list
    window.location.reload();
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container p-4 mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowCsvModal(true)} variant="outline">
              Import CSV
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductGrid 
              products={products} 
              isLoading={isLoading}
              onDelete={handleProductDeleted}
              onUpdate={handleProductUpdated}
            />
          </CardContent>
        </Card>

        <AddProductModal 
          onProductAdded={handleProductAdded}
        />

        <CsvUploadModal
          open={showCsvModal}
          onClose={() => setShowCsvModal(false)}
          onProductsUploaded={handleProductAdded}
        />
      </div>
    </MainLayout>
  );
};

export default ProductManager;
