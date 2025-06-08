
import React from 'react';

interface StoreInfoProps {
  store: {
    id: string;
    name: string;
    logo_image: string | null;
  };
}

const StoreInfo: React.FC<StoreInfoProps> = ({ store }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-2">Sold by</h3>
      <div className="flex items-center gap-3">
        {store.logo_image ? (
          <img 
            src={store.logo_image} 
            alt={store.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {store.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{store.name}</p>
          <p className="text-sm text-gray-600">Trusted Seller</p>
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;
