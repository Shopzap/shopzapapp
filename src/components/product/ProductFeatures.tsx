
import React from 'react';
import { Truck, Shield, RotateCcw, CreditCard, Package } from 'lucide-react';

interface ProductFeaturesProps {
  paymentMethod?: string;
  inventoryCount?: number;
}

const ProductFeatures: React.FC<ProductFeaturesProps> = ({ 
  paymentMethod = 'cod',
  inventoryCount 
}) => {
  return (
    <div className="space-y-4">
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
        {paymentMethod === 'cod' && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <span>Cash on Delivery Available</span>
          </div>
        )}
        {inventoryCount && inventoryCount > 0 && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Package className="h-5 w-5 text-indigo-600" />
            <span>{inventoryCount} items in stock</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFeatures;
