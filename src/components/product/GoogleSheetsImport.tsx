
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface GoogleSheetsImportProps {
  onProductsImported: (count: number) => void;
}

export const GoogleSheetsImport: React.FC<GoogleSheetsImportProps> = ({ onProductsImported }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const isValidGoogleSheetUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('docs.google.com') && url.includes('/spreadsheets/');
    } catch {
      return false;
    }
  };

  const handleImportFromSheet = async () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Google Sheets URL",
        variant: "destructive"
      });
      return;
    }

    if (!isValidGoogleSheetUrl(sheetUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheets URL",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch('/api/import-products-from-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl })
      });
      
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to import products from sheet');
      }

      setImportResult({
        success: result.success || 0,
        failed: result.failed || 0,
        errors: result.errors || []
      });

      if (result.success > 0) {
        toast({
          title: "Import successful",
          description: `${result.success} products imported successfully!`,
        });
        onProductsImported(result.success);
      }

      if (result.failed > 0) {
        toast({
          title: "Partial import",
          description: `${result.failed} products failed to import. Check the details below.`,
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      console.error('Error importing from sheet:', error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import products from sheet. Please check the URL and sheet format.",
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
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Import from Google Sheets
        </CardTitle>
        <CardDescription>
          Import multiple products at once using a Google Sheets link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheet-url">Google Sheets URL</Label>
          <div className="flex gap-2">
            <Input
              id="sheet-url"
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              disabled={isImporting}
              className="flex-1"
            />
            <Button
              onClick={handleImportFromSheet}
              disabled={isImporting || !sheetUrl.trim()}
              variant="outline"
              size="default"
            >
              {isImporting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Import Products
                </>
              )}
            </Button>
          </div>
        </div>

        {importResult && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Import Results</span>
            </div>
            
            <div className="flex gap-2 mb-3">
              {importResult.success > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {importResult.success} Successful
                </Badge>
              )}
              {importResult.failed > 0 && (
                <Badge variant="destructive">
                  {importResult.failed} Failed
                </Badge>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-red-600">Errors:</span>
                <ul className="text-sm text-red-600 mt-1 space-y-1">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-xs">• {error}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li className="text-xs">• And {importResult.errors.length - 5} more errors...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Required Sheet Format:</p>
              <p className="text-xs">Columns: Product Name | Description | Price | Image URL | Category</p>
              <p className="text-xs">Make sure to share your sheet with "Anyone with the link can view"</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" />
          <a 
            href="https://docs.google.com/spreadsheets/d/1example/template" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Download template sheet
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
