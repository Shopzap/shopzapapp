
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Eye, Check, X, Send, DollarSign, Calendar, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface PayoutRequest {
  id: string;
  seller_id: string;
  store_id: string;
  total_earned: number;
  platform_fee: number;
  final_amount: number;
  order_ids: string[];
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  screenshot_url?: string;
  paid_at?: string;
  paid_by?: string;
  admin_notes?: string;
  created_at: string;
  week_start_date: string;
  week_end_date: string;
  store: {
    name: string;
    business_email: string;
    user_id: string;
  };
  seller_name?: string;
  bank_details?: {
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    upi_id?: string;
    payout_method: string;
  };
}

const AdminPayouts = () => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayoutRequests();
  }, []);

  const fetchPayoutRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data: payouts, error } = await supabase
        .from('payout_requests')
        .select(`
          *,
          store:stores(name, business_email, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Fetch bank details for each seller
      const payoutsWithBankDetails = await Promise.all(
        payouts.map(async (payout) => {
          const { data: bankDetails } = await supabase
            .from('bank_details')
            .select('*')
            .eq('user_id', payout.seller_id)
            .single();

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payout.seller_id)
            .single();

          return {
            ...payout,
            bank_details: bankDetails,
            seller_name: profile?.full_name || 'Unknown Seller'
          };
        })
      );

      setPayoutRequests(payoutsWithBankDetails);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePayoutRequests = async () => {
    try {
      setIsProcessing(true);
      
      // Call the function to generate weekly payout requests
      const { data: eligiblePayouts, error: functionError } = await supabase
        .rpc('generate_weekly_payout_requests');

      if (functionError) {
        throw functionError;
      }

      if (!eligiblePayouts || eligiblePayouts.length === 0) {
        toast({
          title: "No Eligible Orders",
          description: "No orders are currently eligible for payout (7-day return period not complete)",
        });
        return;
      }

      // Create payout requests for eligible orders
      const currentDate = new Date();
      const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const payoutRequestsToInsert = eligiblePayouts.map((payout: any) => ({
        seller_id: payout.seller_id,
        store_id: payout.store_id,
        total_earned: payout.total_earned,
        platform_fee: payout.platform_fee,
        final_amount: payout.final_amount,
        order_ids: payout.order_ids,
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('payout_requests')
        .insert(payoutRequestsToInsert);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Success",
        description: `Generated ${eligiblePayouts.length} payout requests`,
      });

      fetchPayoutRequests();
    } catch (error) {
      console.error('Error generating payout requests:', error);
      toast({
        title: "Error",
        description: "Failed to generate payout requests",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadScreenshot = async (file: File, payoutId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `payout-${payoutId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('payout-proofs')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('payout-proofs')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    }
  };

  const markAsPaid = async (payoutRequest: PayoutRequest) => {
    try {
      setIsProcessing(true);
      
      let screenshotUrl = payoutRequest.screenshot_url;
      
      if (screenshotFile) {
        screenshotUrl = await uploadScreenshot(screenshotFile, payoutRequest.id);
      }

      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          paid_by: 'admin', // You can get this from current user context
          screenshot_url: screenshotUrl,
          admin_notes: adminNotes
        })
        .eq('id', payoutRequest.id);

      if (error) {
        throw error;
      }

      // Log the action
      await supabase
        .from('payout_logs')
        .insert({
          payout_request_id: payoutRequest.id,
          action: 'marked_as_paid',
          performed_by: 'admin',
          details: {
            amount: payoutRequest.final_amount,
            admin_notes: adminNotes,
            screenshot_uploaded: !!screenshotFile
          }
        });

      toast({
        title: "Success",
        description: "Payout marked as paid successfully",
      });

      setSelectedRequest(null);
      setAdminNotes('');
      setScreenshotFile(null);
      fetchPayoutRequests();
    } catch (error) {
      console.error('Error marking payout as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark payout as paid",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendPayoutEmail = async (payoutRequest: PayoutRequest) => {
    try {
      setIsProcessing(true);
      
      // Call Supabase Edge Function to send email
      const { error } = await supabase.functions.invoke('send-payout-email', {
        body: {
          to_email: payoutRequest.store.business_email,
          seller_name: payoutRequest.seller_name,
          amount: payoutRequest.final_amount,
          paid_at: payoutRequest.paid_at,
          orders_count: payoutRequest.order_ids.length,
          payout_method: payoutRequest.bank_details?.payout_method || 'Bank Transfer'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email Sent",
        description: "Payout confirmation email sent successfully",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p>Loading payout requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Payout Panel
          </h1>
          <p className="text-gray-600 mt-2">Manage weekly seller payouts and process payments</p>
        </div>
        <Button 
          onClick={generatePayoutRequests}
          disabled={isProcessing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Generate Weekly Payouts
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payoutRequests.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {payoutRequests.filter(p => p.status === 'paid').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{payoutRequests
                    .filter(p => p.status === 'pending')
                    .reduce((sum, p) => sum + p.final_amount, 0)
                    .toLocaleString()
                  }
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(payoutRequests.map(p => p.seller_id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>
            Review and process seller payout requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payoutRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{request.store.name}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Seller: {request.seller_name} • {request.store.business_email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Week: {format(new Date(request.week_start_date), 'MMM dd')} - {format(new Date(request.week_end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold text-green-600">₹{request.final_amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      Total: ₹{request.total_earned.toLocaleString()} • Fee: ₹{request.platform_fee.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{request.order_ids.length} orders</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  {request.status === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedRequest(request)}>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Paid
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}

                  {request.status === 'paid' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendPayoutEmail(request)}
                      disabled={isProcessing}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {payoutRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No payout requests found</p>
                <Button 
                  onClick={generatePayoutRequests}
                  className="mt-4"
                  disabled={isProcessing}
                >
                  Generate Weekly Payouts
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Details/Processing Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedRequest.status === 'pending' ? 'Process Payout' : 'Payout Details'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Seller & Store Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Store Name</Label>
                  <p className="text-sm">{selectedRequest.store.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Seller</Label>
                  <p className="text-sm">{selectedRequest.seller_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedRequest.store.business_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Orders Count</Label>
                  <p className="text-sm">{selectedRequest.order_ids.length} orders</p>
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Earned</Label>
                  <p className="text-lg font-semibold">₹{selectedRequest.total_earned.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Platform Fee (3.9%)</Label>
                  <p className="text-lg font-semibold text-red-600">-₹{selectedRequest.platform_fee.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Final Payout</Label>
                  <p className="text-xl font-bold text-green-600">₹{selectedRequest.final_amount.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              {/* Bank Details */}
              {selectedRequest.bank_details && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Bank Details</Label>
                  <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Account Holder:</strong> {selectedRequest.bank_details.account_holder_name}</p>
                      <p><strong>Bank:</strong> {selectedRequest.bank_details.bank_name}</p>
                      <p><strong>Account Number:</strong> {selectedRequest.bank_details.account_number}</p>
                    </div>
                    <div>
                      <p><strong>IFSC:</strong> {selectedRequest.bank_details.ifsc_code}</p>
                      <p><strong>Method:</strong> {selectedRequest.bank_details.payout_method}</p>
                      {selectedRequest.bank_details.upi_id && (
                        <p><strong>UPI ID:</strong> {selectedRequest.bank_details.upi_id}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Actions for Pending Payouts */}
              {selectedRequest.status === 'pending' && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="screenshot">Upload Payment Screenshot</Label>
                      <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Admin Notes</Label>
                      <Textarea
                        id="notes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes about this payout..."
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={() => markAsPaid(selectedRequest)}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </Button>
                  </div>
                </>
              )}

              {/* Paid Payout Info */}
              {selectedRequest.status === 'paid' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Paid At:</strong> {selectedRequest.paid_at ? format(new Date(selectedRequest.paid_at), 'PPP p') : 'N/A'}</p>
                    <p className="text-sm"><strong>Paid By:</strong> {selectedRequest.paid_by}</p>
                    {selectedRequest.admin_notes && (
                      <p className="text-sm"><strong>Notes:</strong> {selectedRequest.admin_notes}</p>
                    )}
                    {selectedRequest.screenshot_url && (
                      <div>
                        <Label className="text-sm font-medium">Payment Proof</Label>
                        <img src={selectedRequest.screenshot_url} alt="Payment proof" className="mt-2 max-w-full h-auto rounded-lg" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPayouts;
