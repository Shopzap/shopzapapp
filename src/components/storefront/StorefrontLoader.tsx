
import React from 'react';
import { Loader } from 'lucide-react';

interface StorefrontLoaderProps {
  storeName?: string;
  message?: string;
}

const StorefrontLoader: React.FC<StorefrontLoaderProps> = ({ 
  storeName, 
  message = "Loading store..." 
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
      {storeName && (
        <p className="text-gray-500 text-sm mt-2">Store: {storeName}</p>
      )}
    </div>
  );
};

export default StorefrontLoader;
