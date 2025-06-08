
import React from 'react';
import { Truck, Shield, RotateCcw } from 'lucide-react';

const ProductFeatures: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Product Features</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Truck className="h-5 w-5 text-green-600" />
          <span>Free delivery on orders above ₹500</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <RotateCcw className="h-5 w-5 text-blue-600" />
          <span>7-day return policy</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Shield className="h-5 w-5 text-purple-600" />
          <span>Authentic & Quality Assured</span>
        </div>
      </div>
    </div>
  );
};

export default ProductFeatures;
