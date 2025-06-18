
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [fetchedData, setFetchedData] = useState<ProductData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      const validDomains = ['amazon.in', 'amazon.com', 'flipkart.com', 'meesho.com', 'myntra.com', 'ajio.com'];
      return validDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleFetchDetails = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid product URL",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL from Amazon, Flipkart, Meesho, Myntra, or Ajio",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setFetchedData(null);
    setShowPreview(false);

    try {
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const productData = await res.json();

      if (!res.ok) {
        throw new Error(productData.error || 'Failed to fetch product details');
      }

      setFetchedData(productData);
      setShowPreview(true);
      
      toast({
        title: "Success",
        description: "Product details fetched successfully!",
      });
      
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error fetching product",
        description: error.message || "Failed to fetch product details. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleUseDetails = () => {
    if (fetchedData) {
      onProductImported(fetchedData);
      toast({
        title: "Product details applied",
        description: "You can now review and edit the details before saving",
      });
      setShowPreview(false);
      setUrl('');
      setFetchedData(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import from Product URL
        </CardTitle>
        <CardDescription>
          Automatically fetch product details from Amazon, Flipkart, Meesho, Myntra, or Ajio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="import-url">Product URL</Label>
          <div className="flex gap-2">
            <Input
              id="import-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.in/dp/B089MS8TA8"
              disabled={isImporting}
              className="flex-1"
            />
            <Button
              onClick={handleFetchDetails}
              disabled={isImporting || !url.trim()}
              variant="outline"
              size="default"
            >
              {isImporting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Fetch Details
                </>
              )}
            </Button>
          </div>
        </div>

        {showPreview && fetchedData && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Product Details Fetched</span>
            </div>
            
            <div className="grid gap-3">
              <div>
                <span className="text-sm font-medium">Name:</span>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {fetchedData.name || 'No name found'}
                </p>
              </div>
              
              {fetchedData.price && (
                <div>
                  <span className="text-sm font-medium">Price:</span>
                  <p className="text-sm text-muted-foreground mt-1">₹{fetchedData.price}</p>
                </div>
              )}
              
              {fetchedData.image_url && (
                <div>
                  <span className="text-sm font-medium">Image:</span>
                  <div className="mt-1">
                    <img
                      src={fetchedData.image_url}
                      alt="Product preview"
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              {fetchedData.description && (
                <div>
                  <span className="text-sm font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {fetchedData.description}
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleUseDetails}
              className="w-full mt-4"
              size="sm"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Use These Details
            </Button>
          </div>
        )}

        {!showPreview && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Paste a product URL from supported e-commerce sites and click "Fetch Details" to automatically import product information.
            </AlertDescription>
          </Alert>
        )}
        
        <p className="text-xs text-muted-foreground">
          Supported sites: Amazon, Flipkart, Meesho, Myntra, Ajio
        </p>
      </CardContent>
    </Card>
  );
};
