
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, AlertCircle } from 'lucide-react';

const FixOrder = () => {
  const { orderId } = useParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [orderFound, setOrderFound] = useState(false);
  const [orderData, setOrderData] = useState(null);

  React.useEffect(() => {
    // Simulate fetching order data
    if (orderId) {
      const mockOrderData = {
        id: orderId,
        buyerName: 'John Doe',
        storeName: 'Tech Store',
        totalAmount: 2498,
        status: 'confirmed',
        canEdit: true, // Can edit within 24 hours
        orderDate: '2024-01-15',
        currentAddress: '123 Main St, City, State 123456'
      };
      
      setOrderData(mockOrderData);
      setOrderFound(true);
      setFormData({
        fullName: mockOrderData.buyerName,
        phone: '',
        address: '123 Main St',
        city: 'City',
        state: 'State',
        zipCode: '123456',
        landmark: ''
      });
    }
  }, [orderId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to update address
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Address Updated Successfully",
        description: "Your shipping address has been updated. You'll receive a confirmation email shortly."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update your address. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!orderFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-gray-600">
                We couldn't find an order with ID: {orderId}. Please check your order ID and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (orderData && !orderData.canEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Edit Window Expired</h2>
              <p className="text-gray-600">
                Address changes are only allowed within 24 hours of order placement. 
                Please contact customer support for assistance.
              </p>
              <Button className="mt-4" onClick={() => window.open('mailto:support@shopzap.io')}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Fix Shipping Address</h1>
          <p className="text-gray-600">
            Update your shipping address for order #{orderId?.slice(-8)}
          </p>
        </div>

        {/* Order Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Order ID:</strong> #{orderId?.slice(-8)}</p>
              <p><strong>Store:</strong> {orderData?.storeName}</p>
              <p><strong>Total:</strong> ₹{orderData?.totalAmount.toLocaleString()}</p>
              <p><strong>Current Status:</strong> {orderData?.status}</p>
              <p><strong>Current Address:</strong> {orderData?.currentAddress}</p>
            </div>
          </CardContent>
        </Card>

        {/* Address Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House number, street name, area"
                  required
                />
              </div>

              <div>
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Near any famous place, building, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Important Note</p>
                    <p className="text-sm text-yellow-700">
                      Address changes are only allowed within 24 hours of order placement. 
                      After updating, you'll receive a confirmation email.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating Address...' : 'Update Shipping Address'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FixOrder;
