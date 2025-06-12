
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, FileSpreadsheet, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CsvUploadModalProps {
  open: boolean;
  onClose: () => void;
  onProductsUploaded: (count: number) => void;
}

type ProductCsvRow = {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  status?: string;
};

const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ 
  open, 
  onClose,
  onProductsUploaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{success: number, failed: number, errors: string[]}>({
    success: 0,
    failed: 0,
    errors: []
  });
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFile(null);
    setShowResults(false);
    setResults({success: 0, failed: 0, errors: []});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive'
      });
      return;
    }
    
    setFile(file);
  };

  const parseCsvFile = (csvText: string): ProductCsvRow[] => {
    // Parse CSV to array of objects
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines
      .slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        const row: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          // Skip empty values
          if (!value) return;
          
          // Parse numeric fields
          if (header === 'price') {
            row[header] = parseFloat(value);
          } else {
            row[header] = value;
          }
        });
        
        return row as ProductCsvRow;
      });
  };

  // Function to generate slug from product name
  const generateSlug = (name: string, counter?: number): string => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    return counter ? `${baseSlug}-${counter}` : baseSlug;
  };

  // Function to check if slug exists and generate unique one
  const getUniqueSlug = async (name: string, storeId: string): Promise<string> => {
    let slug = generateSlug(name);
    let counter = 1;
    
    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) {
        return slug;
      }
      
      counter++;
      slug = generateSlug(name, counter);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setResults({success: 0, failed: 0, errors: []});
      
      // Get store ID for the current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: 'Authentication required',
          description: 'Please login to upload products',
          variant: 'destructive'
        });
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (storeError || !storeData) {
        toast({
          title: 'Store not found',
          description: 'Please complete the onboarding process',
          variant: 'destructive'
        });
        return;
      }

      // Read CSV file
      const text = await file.text();
      const products = parseCsvFile(text);
      
      if (products.length === 0) {
        toast({
          title: 'Empty CSV file',
          description: 'No valid product data found in the CSV file',
          variant: 'destructive'
        });
        return;
      }
      
      let successCount = 0;
      let failedCount = 0;
      let errorMessages: string[] = [];
      
      // Insert each product
      for (const product of products) {
        if (!product.name || product.price === undefined) {
          failedCount++;
          errorMessages.push(`Missing required fields for product: ${product.name || 'Unknown'}`);
          continue;
        }
        
        try {
          // Generate unique slug for this product
          const slug = await getUniqueSlug(product.name, storeData.id);
          
          const { error } = await supabase
            .from('products')
            .insert({
              store_id: storeData.id,
              name: product.name,
              description: product.description,
              price: product.price,
              image_url: product.image_url,
              status: product.status || 'active',
              slug: slug
            });
            
          if (error) {
            failedCount++;
            errorMessages.push(`Error adding product "${product.name}": ${error.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          failedCount++;
          errorMessages.push(`Error adding product "${product.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      setResults({
        success: successCount,
        failed: failedCount,
        errors: errorMessages
      });
      
      setShowResults(true);
      
      if (successCount > 0) {
        onProductsUploaded(successCount);
      }
      
    } catch (error) {
      console.error('Error processing CSV file:', error);
      toast({
        title: 'Error processing CSV file',
        description: error instanceof Error ? error.message : 'Please check your file format and try again',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = 'name,description,price,image_url,status';
    const sampleData = 'Example Product,This is a sample product description,19.99,https://example.com/image.jpg,active';
    const csvContent = `${headers}\n${sampleData}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
        if (!isUploading) resetForm();
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
        </DialogHeader>
        
        {!showResults ? (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>CSV Format Requirements</AlertTitle>
              <AlertDescription className="text-sm">
                Your CSV file should include: name, description, price, image_url, and status columns.
                Only name and price are required.
              </AlertDescription>
            </Alert>
            
            <div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDownloadTemplate}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <div className="mt-1">
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label 
                  htmlFor="csv-file" 
                  className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 w-full"
                >
                  {file ? (
                    <div className="text-center">
                      <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p>{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p>Click to select a CSV file</p>
                      <p className="text-xs text-muted-foreground">
                        or drag and drop here
                      </p>
                    </div>
                  )}
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload and Import'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{results.success}</div>
                <div className="text-sm text-muted-foreground">Products imported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{results.failed}</div>
                <div className="text-sm text-muted-foreground">Failed imports</div>
              </div>
            </div>
            
            {results.errors.length > 0 && (
              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                <h3 className="font-medium mb-2">Import Errors:</h3>
                <ul className="text-sm space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index} className="text-destructive">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  if (results.success > 0) {
                    onClose();
                    resetForm();
                  } else {
                    setShowResults(false);
                  }
                }} 
              >
                {results.success > 0 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Done
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CsvUploadModal;
