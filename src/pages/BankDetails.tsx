
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Trash2, AlertTriangle } from 'lucide-react';
import BankDetailsForm from '@/components/bank/BankDetailsForm';
import { useBankDetails } from '@/hooks/useBankDetails';

const BankDetails = () => {
  const { 
    bankDetails, 
    isLoading, 
    error, 
    saveBankDetails, 
    deleteBankDetails, 
    isSaving, 
    isDeleting 
  } = useBankDetails();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading bank details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load bank details. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSave = (formData: any) => {
    saveBankDetails(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your bank details? This action cannot be undone.')) {
      deleteBankDetails();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bank Account Details</h1>
        <p className="text-muted-foreground">
          Manage your bank account details for receiving payouts from your store sales.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Bank Details Form */}
        <BankDetailsForm
          initialData={bankDetails}
          onSave={handleSave}
          isLoading={isSaving}
        />

        {/* Additional Actions */}
        {bankDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Bank Details</CardTitle>
              <CardDescription>
                Additional actions for your bank account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Bank Details
                    </>
                  )}
                </Button>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Ensure your bank details are accurate. 
                  Incorrect information may delay or prevent payout processing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payout Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Payouts are processed weekly on Fridays</p>
            <p>• Minimum payout amount is ₹100</p>
            <p>• Bank transfers typically take 1-3 business days</p>
            <p>• UPI transfers are usually instant</p>
            <p>• You'll receive an email notification when a payout is processed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankDetails;
