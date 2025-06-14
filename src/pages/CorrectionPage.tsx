
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { Edit, ArrowLeft, Package, User, MapPin, Phone, Mail, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CorrectionPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    buyer_address: '',
    correction_reason: '',
    requested_changes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Fetch order details
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['order-correction', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID required');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              id,
              name,
              image_url
            )
          ),
          stores (
            name,
            username,
            business_email,
            phone_number
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });

  // Calculate time remaining for corrections (24 hours from order creation)
  useEffect(() => {
    if (orderDetails?.created_at) {
      const orderTime = new Date(orderDetails.created_at).getTime();
      const currentTime = new Date().getTime();
      const deadline = orderTime + (24 * 60 * 60 * 1000); // 24 hours
      const remaining = deadline - currentTime;

      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining('Correction period expired');
      }
    }
  }, [orderDetails]);

  // Pre-fill form with existing order data
  useEffect(() => {
    if (orderDetails) {
      setFormData({
        buyer_name: orderDetails.buyer_name || '',
        buyer_email: orderDetails.buyer_email || '',
        buyer_phone: orderDetails.buyer_phone || '',
        buyer_address: orderDetails.buyer_address || '',
        correction_reason: '',
        requested_changes: ''
      });
    }
  }, [orderDetails]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitCorrection = async () => {
    if (!orderId || !orderDetails) return;

    setIsSubmitting(true);
    try {
      // Check if correction period is still valid
      const orderTime = new Date(orderDetails.created_at).getTime();
      const currentTime = new Date().getTime();
      const deadline = orderTime + (24 * 60 * 60 * 1000);

      if (currentTime > deadline) {
        toast({
          title: "Correction Period Expired",
          description: "You can only make corrections within 24 hours of placing the order.",
          variant: "destructive"
        });
        return;
      }

      // Update order with corrected information
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          buyer_name: formData.buyer_name,
          buyer_email: formData.buyer_email,
          buyer_phone: formData.buyer_phone,
          buyer_address: formData.buyer_address,
          order_notes: `${orderDetails.order_notes || ''}\n\nCorrection Request: ${formData.correction_reason}\nRequested Changes: ${formData.requested_changes}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Send notification email to seller about the correction
      await supabase.functions.invoke('send-order-email', {
        body: {
          orderId,
          eventType: 'order_correction',
          buyerEmail: formData.buyer_email,
          buyerName: formData.buyer_name,
          correctionReason: formData.correction_reason,
          requestedChanges: formData.requested_changes,
          sellerEmail: orderDetails.stores.business_email,
          storeName: orderDetails.stores.name
        }
      });

      toast({
        title: "Correction Submitted Successfully",
        description: "Your correction request has been sent to the seller. They will contact you shortly.",
      });

      // Redirect back to thank you page
      setTimeout(() => {
        navigate(`/thank-you?order_id=${orderId}`);
      }, 2000);

    } catch (error) {
      console.error('Error submitting correction:', error);
      toast({
        title: "Error",
        description: "Failed to submit correction. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Package className="h-8 w-8 animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!orderDetails) {
    return (
      <ResponsiveLayout>
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We could not find the order you're trying to correct.
            </p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const isExpired = timeRemaining === 'Correction period expired';

  return (
    <ResponsiveLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <Edit className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h1 className="text-3xl font-bold mb-2">Correct Order Details</h1>
            <p className="text-muted-foreground">
              Make changes to your order information within 24 hours of placing it
            </p>
          </div>

          {/* Time Remaining Alert */}
          <Card className={`mb-6 ${isExpired ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
                <div>
                  <p className={`font-semibold ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                    {isExpired ? 'Correction Period Expired' : 'Time Remaining for Corrections'}
                  </p>
                  <p className={`text-sm ${isExpired ? 'text-red-700' : 'text-orange-700'}`}>
                    {isExpired 
                      ? 'You can no longer make corrections to this order. Please contact support for assistance.'
                      : timeRemaining
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Order ID</p>
                  <p>#{orderDetails.id.slice(-8)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Store</p>
                  <p>{orderDetails.stores.name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Order Date</p>
                  <p>{new Date(orderDetails.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">₹{Number(orderDetails.total_price).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correction Form */}
          {!isExpired && (
            <Card>
              <CardHeader>
                <CardTitle>Update Your Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Make any necessary changes to your order details below
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buyer_name">Full Name</Label>
                      <Input
                        id="buyer_name"
                        value={formData.buyer_name}
                        onChange={(e) => handleInputChange('buyer_name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="buyer_email">Email Address</Label>
                      <Input
                        id="buyer_email"
                        type="email"
                        value={formData.buyer_email}
                        onChange={(e) => handleInputChange('buyer_email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div>
                    <Label htmlFor="buyer_phone">Phone Number</Label>
                    <Input
                      id="buyer_phone"
                      value={formData.buyer_phone}
                      onChange={(e) => handleInputChange('buyer_phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div>
                    <Label htmlFor="buyer_address">Complete Address</Label>
                    <Textarea
                      id="buyer_address"
                      value={formData.buyer_address}
                      onChange={(e) => handleInputChange('buyer_address', e.target.value)}
                      placeholder="Enter your complete delivery address"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Correction Details */}
                <div>
                  <h4 className="font-semibold mb-4">Correction Details</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="correction_reason">Reason for Correction</Label>
                      <Input
                        id="correction_reason"
                        value={formData.correction_reason}
                        onChange={(e) => handleInputChange('correction_reason', e.target.value)}
                        placeholder="e.g., Wrong address, Phone number changed, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="requested_changes">Detailed Changes Requested</Label>
                      <Textarea
                        id="requested_changes"
                        value={formData.requested_changes}
                        onChange={(e) => handleInputChange('requested_changes', e.target.value)}
                        placeholder="Please describe exactly what needs to be changed..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitCorrection}
                    disabled={isSubmitting || !formData.correction_reason.trim()}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Package className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Correction
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Support for Expired Orders */}
          {isExpired && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold text-blue-800 mb-2">Need to Make Changes?</h3>
                <p className="text-blue-700 mb-4">
                  The 24-hour correction period has expired, but our support team can still help you.
                </p>
                <Button 
                  onClick={() => window.open('mailto:support@shopzap.io?subject=Order Correction Request - ' + orderDetails.id, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default CorrectionPage;
