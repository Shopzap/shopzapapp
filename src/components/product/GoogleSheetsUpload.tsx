
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileSpreadsheet, Check, X } from 'lucide-react';

interface ParsedProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  inventory_count: number;
  image_url?: string;
}

const GoogleSheetsUpload: React.FC<{ onProductsAdded: () => void }> = ({ onProductsAdded }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSV = (text: string): ParsedProduct[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products: ParsedProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      const product: ParsedProduct = {
        name: '',
        description: '',
        price: 0,
        category: 'Other',
        inventory_count: 0
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'name':
          case 'product name':
          case 'title':
            product.name = value;
            break;
          case 'description':
          case 'desc':
            product.description = value;
            break;
          case 'price':
          case 'cost':
          case 'amount':
            product.price = parseFloat(value) || 0;
            break;
          case 'category':
          case 'type':
            product.category = value || 'Other';
            break;
          case 'stock':
          case 'inventory':
          case 'quantity':
          case 'qty':
            product.inventory_count = parseInt(value) || 0;
            break;
          case 'image':
          case 'image_url':
          case 'photo':
            product.image_url = value;
            break;
        }
      });

      if (product.name) {
        products.push(product);
      }
    }

    return products;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const text = await file.text();
    const products = parseCSV(text);
    
    if (products.length === 0) {
      toast({
        title: "No products found",
        description: "Could not parse any products from the CSV file",
        variant: "destructive"
      });
      return;
    }

    setParsedProducts(products);
    setShowPreview(true);
    
    toast({
      title: "CSV parsed successfully",
      description: `Found ${products.length} products`,
    });
  };

  const handleBulkImport = async () => {
    if (!user || parsedProducts.length === 0) return;

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

      const productsToInsert = parsedProducts.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        store_id: storeData.id,
        status: 'active',
        category: product.category,
        inventory_count: product.inventory_count,
        slug: product.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        product_type: 'simple',
        is_published: true
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;

      toast({
        title: "Products imported successfully",
        description: `${parsedProducts.length} products have been added to your store`,
      });

      setParsedProducts([]);
      setShowPreview(false);
      onProductsAdded();
    } catch (error: any) {
      console.error('Error importing products:', error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import Products from CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showPreview ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <Button variant="outline" className="mb-2">
                    Choose CSV File
                  </Button>
                </Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500">
                  Upload a CSV file with columns: name, description, price, category, stock, image_url
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>name</strong> - Product name (required)</li>
                <li><strong>description</strong> - Product description</li>
                <li><strong>price</strong> - Product price in rupees</li>
                <li><strong>category</strong> - Product category</li>
                <li><strong>stock</strong> - Inventory quantity</li>
                <li><strong>image_url</strong> - Product image URL (optional)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview Products ({parsedProducts.length})</h3>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={isLoading}>
                  <Check className="w-4 h-4 mr-2" />
                  Import All Products
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.inventory_count}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsUpload;
