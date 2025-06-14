
import React from 'react';
import { Store } from 'lucide-react';

interface StoreInfoProps {
  storeName?: string;
  productId: string;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ storeName, productId }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
        <Store className="h-4 w-4" />
        Sold by
      </h3>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
          {storeName ? storeName.charAt(0).toUpperCase() : 'S'}
        </div>
        <div>
          <p className="font-medium text-gray-900">{storeName || 'Store'}</p>
          <p className="text-sm text-gray-600">Trusted Seller</p>
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;
