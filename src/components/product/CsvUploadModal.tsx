
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle, Download, FileUp, Loader2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CsvUploadModalProps {
  open: boolean;
  onClose: () => void;
  onProductsUploaded: (count: number) => void;
}

const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  open,
  onClose,
  onProductsUploaded
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
      setUploadResults(null);
    } else {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    try {
      // Get user's session to identify their store
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Authentication required",
          description: "Please login to upload products",
          variant: "destructive"
        });
        return;
      }

      // Get the user's store
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
        return;
      }

      // Parse CSV
      const text = await csvFile.text();
      const rows = text.split('\n');
      
      // Extract headers
      const headers = rows[0].split(',').map(h => h.trim());
      
      // Define required fields
      const requiredFields = ['name', 'price'];
      
      // Check for required fields
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        toast({
          title: "Invalid CSV format",
          description: `Missing required fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      // Process rows
      const products = [];
      const errors = [];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue; // Skip empty rows
        
        // Split by comma, but preserve commas in quotes
        const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i}: Column count mismatch`);
          continue;
        }
        
        // Create object from headers and values
        const product = headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as Record<string, string>);
        
        // Validate required fields
        if (!product.name || !product.price) {
          errors.push(`Row ${i}: Missing required fields`);
          continue;
        }
        
        // Convert price to number
        const price = parseFloat(product.price);
        if (isNaN(price)) {
          errors.push(`Row ${i}: Invalid price format`);
          continue;
        }
        
        // Add to products array
        products.push({
          store_id: storeData.id,
          name: product.name,
          description: product.description || null,
          price: price,
          category: product.category || null,
          sku: product.sku || null,
          inventory_count: product.inventory !== undefined ? parseInt(product.inventory) : null,
          status: product.status?.toLowerCase() === 'draft' ? 'draft' : 'active',
          image_url: product.image_url || null,
        });
      }
      
      // Insert products in batches
      let successCount = 0;
      
      if (products.length > 0) {
        const { error } = await supabase
          .from('products')
          .insert(products);
          
        if (error) {
          errors.push(`Database error: ${error.message}`);
        } else {
          successCount = products.length;
        }
      }
      
      // Set results
      setUploadResults({
        success: successCount,
        failed: errors.length,
        errors: errors
      });
      
      // If at least one product was added successfully
      if (successCount > 0) {
        onProductsUploaded(successCount);
      }
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({
        title: "Error processing CSV",
        description: "Please check the file format and try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'name,description,price,category,sku,inventory,status,image_url\n' +
      'Sample Product,This is a sample product description,19.99,Electronics,SKU123,100,active,https://example.com/image.jpg\n' +
      'Draft Product,This is a draft product,29.99,Clothing,SKU456,50,draft,';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopzap_product_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your product data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!uploadResults ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="csv-file" className="text-sm font-medium">
                    CSV File
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={downloadTemplate}
                    className="h-8 px-2 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download Template
                  </Button>
                </div>
                {!csvFile ? (
                  <div className="mt-1 border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CSV file only
                      </p>
                    </div>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="csv-file" 
                      className="mt-4 btn-hover inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2"
                    >
                      Select CSV File
                    </label>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center p-3 bg-accent/30 rounded-md">
                    <FileUp className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate flex-1">
                      {csvFile.name}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setCsvFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <Alert>
                <AlertDescription className="text-xs">
                  The CSV file should include columns: name, description, price, category, sku, inventory, status, image_url. 
                  Name and price are required fields.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleUpload} 
                  disabled={isUploading || !csvFile}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload and Import'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {uploadResults.success > 0 ? (
                  <CheckCircle className="h-16 w-16 text-success" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-destructive" />
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">
                  {uploadResults.success > 0 
                    ? "Products Imported Successfully!" 
                    : "Import Failed"}
                </h3>
                <p className="text-muted-foreground">
                  {uploadResults.success} products imported successfully.
                  {uploadResults.failed > 0 && (
                    ` ${uploadResults.failed} products failed to import.`
                  )}
                </p>
              </div>
              
              {uploadResults.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto p-3 text-xs bg-accent/30 rounded-md space-y-1">
                  {uploadResults.errors.map((error, index) => (
                    <p key={index} className="text-destructive">{error}</p>
                  ))}
                </div>
              )}
              
              <div className="flex justify-center pt-2">
                <Button onClick={onClose}>
                  {uploadResults.success > 0 ? "Done" : "Close"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvUploadModal;
