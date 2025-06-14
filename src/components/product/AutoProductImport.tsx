
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ProductData {
  name: string;
  description: string;
  price: string;
  image_url: string;
}

interface AutoProductImportProps {
  onProductImported: (productData: ProductData) => void;
}

export const AutoProductImport: React.FC<AutoProductImportProps> = ({ onProductImported }) => {
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      // Simulate product import (in real implementation, this would scrape the URL)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedData = simulateProductScraping(url);
      onProductImported(simulatedData);
      
      toast({
        title: "Success",
        description: "Product imported successfully!",
      });
      
      setUrl('');
    } catch (error) {
      console.error('Error importing product:', error);
      toast({
        title: "Error",
        description: "Failed to import product. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const simulateProductScraping = (url: string): ProductData => {
    // Simulate scraping based on URL patterns
    const products = [
      {
        name: "Premium Cotton T-Shirt",
        description: "Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% premium cotton with a modern fit.",
        price: "599",
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
      },
      {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation and 20-hour battery life. Perfect for music lovers and professionals.",
        price: "2999",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
      },
      {
        name: "Stainless Steel Water Bottle",
        description: "Eco-friendly stainless steel water bottle with temperature retention. Keeps drinks hot for 12 hours, cold for 24 hours.",
        price: "899",
        image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop"
      }
    ];
    
    return products[Math.floor(Math.random() * products.length)];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import from URL
        </CardTitle>
        <CardDescription>
          Import product details from Meesho, Amazon, or other e-commerce URLs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="import-url">Product URL</Label>
          <Input
            id="import-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com/product-url"
            disabled={isImporting}
          />
        </div>
        
        <Button
          onClick={handleImport}
          disabled={isImporting || !url.trim()}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Import Product
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Supported platforms: Meesho, Amazon, Flipkart, and more
        </p>
      </CardContent>
    </Card>
  );
};
