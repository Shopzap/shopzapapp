
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BankDetails {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  pan_number: string;
  gst_number: string;
  payout_method: 'bank_transfer' | 'upi';
}

interface BankDetailsFormProps {
  initialData?: Partial<BankDetails>;
  onSave?: (data: BankDetails) => void;
  isLoading?: boolean;
}

const BankDetailsForm: React.FC<BankDetailsFormProps> = ({ 
  initialData, 
  onSave, 
  isLoading = false 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BankDetails>({
    account_holder_name: initialData?.account_holder_name || '',
    bank_name: initialData?.bank_name || '',
    account_number: initialData?.account_number || '',
    ifsc_code: initialData?.ifsc_code || '',
    upi_id: initialData?.upi_id || '',
    pan_number: initialData?.pan_number || '',
    gst_number: initialData?.gst_number || '',
    payout_method: initialData?.payout_method || 'bank_transfer',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BankDetails, string>>>({});

  const handleInputChange = (field: keyof BankDetails) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (value: 'bank_transfer' | 'upi') => {
    setFormData(prev => ({ ...prev, payout_method: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BankDetails, string>> = {};

    if (!formData.account_holder_name.trim()) {
      newErrors.account_holder_name = 'Account holder name is required';
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required';
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(formData.account_number)) {
      newErrors.account_number = 'Account number must be 9-18 digits';
    }

    if (!formData.ifsc_code.trim()) {
      newErrors.ifsc_code = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code.toUpperCase())) {
      newErrors.ifsc_code = 'Invalid IFSC code format';
    }

    // UPI validation (optional)
    if (formData.upi_id && !/^[\w.-]+@[\w.-]+$/.test(formData.upi_id)) {
      newErrors.upi_id = 'Invalid UPI ID format';
    }

    // PAN validation (optional)
    if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) {
      newErrors.pan_number = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    // GST validation (optional)
    if (formData.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_number.toUpperCase())) {
      newErrors.gst_number = 'Invalid GST number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    // Convert to uppercase for certain fields
    const processedData = {
      ...formData,
      ifsc_code: formData.ifsc_code.toUpperCase(),
      pan_number: formData.pan_number.toUpperCase(),
      gst_number: formData.gst_number.toUpperCase(),
    };

    onSave?.(processedData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bank Account Details
        </CardTitle>
        <CardDescription>
          Add your bank account details for receiving payouts. All information is encrypted and secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="account_holder_name">Account Holder Name *</Label>
            <Input
              id="account_holder_name"
              value={formData.account_holder_name}
              onChange={handleInputChange('account_holder_name')}
              placeholder="Enter account holder name"
              className={errors.account_holder_name ? 'border-red-500' : ''}
            />
            {errors.account_holder_name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.account_holder_name}
              </p>
            )}
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name *</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange('bank_name')}
              placeholder="Enter bank name"
              className={errors.bank_name ? 'border-red-500' : ''}
            />
            {errors.bank_name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.bank_name}
              </p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number *</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={handleInputChange('account_number')}
              placeholder="Enter account number"
              type="text"
              className={errors.account_number ? 'border-red-500' : ''}
            />
            {errors.account_number && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.account_number}
              </p>
            )}
          </div>

          {/* IFSC Code */}
          <div className="space-y-2">
            <Label htmlFor="ifsc_code">IFSC Code *</Label>
            <Input
              id="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleInputChange('ifsc_code')}
              placeholder="Enter IFSC code (e.g., SBIN0001234)"
              className={errors.ifsc_code ? 'border-red-500' : ''}
            />
            {errors.ifsc_code && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.ifsc_code}
              </p>
            )}
          </div>

          {/* UPI ID */}
          <div className="space-y-2">
            <Label htmlFor="upi_id">UPI ID (Optional)</Label>
            <Input
              id="upi_id"
              value={formData.upi_id}
              onChange={handleInputChange('upi_id')}
              placeholder="Enter UPI ID (e.g., name@paytm)"
              className={errors.upi_id ? 'border-red-500' : ''}
            />
            {errors.upi_id && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.upi_id}
              </p>
            )}
          </div>

          {/* PAN Number */}
          <div className="space-y-2">
            <Label htmlFor="pan_number">PAN Number (Optional)</Label>
            <Input
              id="pan_number"
              value={formData.pan_number}
              onChange={handleInputChange('pan_number')}
              placeholder="Enter PAN number (e.g., ABCDE1234F)"
              className={errors.pan_number ? 'border-red-500' : ''}
            />
            {errors.pan_number && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.pan_number}
              </p>
            )}
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <Label htmlFor="gst_number">GST Number (Optional)</Label>
            <Input
              id="gst_number"
              value={formData.gst_number}
              onChange={handleInputChange('gst_number')}
              placeholder="Enter GST number"
              className={errors.gst_number ? 'border-red-500' : ''}
            />
            {errors.gst_number && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.gst_number}
              </p>
            )}
          </div>

          {/* Payout Method */}
          <div className="space-y-2">
            <Label htmlFor="payout_method">Preferred Payout Method *</Label>
            <Select value={formData.payout_method} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select payout method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your bank details are encrypted and stored securely. They will only be used for processing payouts.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Bank Details'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankDetailsForm;
