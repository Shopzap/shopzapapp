
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

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
      const { data: productData, error } = await supabase.functions.invoke('scrape-url', {
        body: { url },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      onProductImported(productData);
      
      toast({
        title: "Success",
        description: "Product imported successfully!",
      });
      
      setUrl('');
    } catch (error: any) {
      console.error('Error importing product:', error);
      toast({
        title: "Error importing product",
        description: error.message || "Failed to import product. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import from URL
        </CardTitle>
        <CardDescription>
          Import product details from e-commerce URLs (e.g., Amazon)
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
            placeholder="https://www.amazon.in/dp/B089MS8TA8"
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
          Note: This is a basic importer and may not work with all websites.
        </p>
      </CardContent>
    </Card>
  );
};
