import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Save, Edit } from 'lucide-react';

interface BankDetail {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
  pan_number: string | null;
  gst_number: string | null;
  payout_method: 'bank_transfer' | 'upi';
}

const BankDetails: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bankDetails, setBankDetails] = useState<BankDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    pan_number: '',
    gst_number: '',
    payout_method: 'bank_transfer' as 'bank_transfer' | 'upi'
  });

  useEffect(() => {
    fetchBankDetails();
  }, [user]);

  const fetchBankDetails = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bank_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Cast the payout_method to the expected type
        const bankDetailsData: BankDetail = {
          ...data,
          payout_method: data.payout_method as 'bank_transfer' | 'upi'
        };
        setBankDetails(bankDetailsData);
        setFormData({
          bank_name: data.bank_name,
          account_holder_name: data.account_holder_name,
          account_number: data.account_number,
          ifsc_code: data.ifsc_code,
          upi_id: data.upi_id || '',
          pan_number: data.pan_number || '',
          gst_number: data.gst_number || '',
          payout_method: data.payout_method as 'bank_transfer' | 'upi'
        });
      } else {
        setIsEditing(true); // No bank details exist, enable editing
      }
    } catch (error: any) {
      console.error('Error fetching bank details:', error);
      toast({
        title: "Error",
        description: "Failed to load bank details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      
      const dataToSave = {
        user_id: user.id,
        bank_name: formData.bank_name,
        account_holder_name: formData.account_holder_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        upi_id: formData.upi_id || null,
        pan_number: formData.pan_number || null,
        gst_number: formData.gst_number || null,
        payout_method: formData.payout_method
      };

      let result;
      if (bankDetails) {
        result = await supabase
          .from('bank_details')
          .update(dataToSave)
          .eq('id', bankDetails.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('bank_details')
          .insert(dataToSave)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const updatedData: BankDetail = {
        ...result.data,
        payout_method: result.data.payout_method as 'bank_transfer' | 'upi'
      };
      setBankDetails(updatedData);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Bank details saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving bank details:', error);
      toast({
        title: "Error",
        description: "Failed to save bank details",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (bankDetails) {
      setFormData({
        bank_name: bankDetails.bank_name,
        account_holder_name: bankDetails.account_holder_name,
        account_number: bankDetails.account_number,
        ifsc_code: bankDetails.ifsc_code,
        upi_id: bankDetails.upi_id || '',
        pan_number: bankDetails.pan_number || '',
        gst_number: bankDetails.gst_number || '',
        payout_method: bankDetails.payout_method
      });
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bank Details</h1>
        {bankDetails && !isEditing && (
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Banking Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="payout_method">Preferred Payout Method</Label>
              <Select 
                value={formData.payout_method} 
                onValueChange={(value: 'bank_transfer' | 'upi') => 
                  setFormData({ ...formData, payout_method: value })
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_holder_name">Account Holder Name</Label>
              <Input
                id="account_holder_name"
                value={formData.account_holder_name}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <Input
                id="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upi_id">UPI ID (Optional)</Label>
              <Input
                id="upi_id"
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                disabled={!isEditing}
                placeholder="yourname@upi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pan_number">PAN Number (Optional)</Label>
              <Input
                id="pan_number"
                value={formData.pan_number}
                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                disabled={!isEditing}
                placeholder="ABCDE1234F"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst_number">GST Number (Optional)</Label>
              <Input
                id="gst_number"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                disabled={!isEditing}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Details'}
              </Button>
              {bankDetails && (
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankDetails;
