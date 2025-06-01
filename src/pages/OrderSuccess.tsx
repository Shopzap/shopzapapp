
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Calendar, MapPin, Mail } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state || {};
  
  const {
    orderId = 'ORD-12345',
    orderItems = [],
    total = 0,
    customerInfo = {},
    estimatedDelivery = 'Not specified'
  } = orderData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">Thank you for your order. We've received your request and will process it shortly.</p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Order Details</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono font-medium">{orderId}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h3 className="font-medium mb-3 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Items Ordered
          </h3>
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 object-cover rounded-md" 
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    ₹{item.price.toLocaleString()} × {item.quantity}
                  </p>
                </div>
                <span className="font-medium">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Delivery Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
              <div>
                <p className="font-medium">Delivery Address:</p>
                <p className="text-gray-600">
                  {customerInfo.address}<br />
                  {customerInfo.city}, {customerInfo.state} - {customerInfo.zipCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <span className="font-medium">Estimated Delivery: </span>
                <span className="text-gray-600">{estimatedDelivery}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-2 flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Order Confirmation
        </h3>
        <p className="text-sm text-gray-600">
          A confirmation email has been sent to <strong>{customerInfo.email}</strong> with your order details and tracking information.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to="/store/demo">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link to="/orders">View My Orders</Link>
        </Button>
      </div>

      {/* Additional Information */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Need help with your order?
        </p>
        <div className="space-x-4">
          <Link to="/contact" className="text-blue-600 hover:underline text-sm">
            Contact Support
          </Link>
          <Link to="/track-order" className="text-blue-600 hover:underline text-sm">
            Track Your Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
