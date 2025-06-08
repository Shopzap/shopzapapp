
import React from 'react';
import { AlertCircle, Home, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface StoreNotFoundProps {
  storeName?: string;
  message?: string;
}

const StoreNotFound: React.FC<StoreNotFoundProps> = ({ 
  storeName, 
  message = "Store not found" 
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{message}</h1>
          {storeName && (
            <p className="text-gray-600">
              The store "{storeName}" doesn't exist or is currently unavailable.
            </p>
          )}
          <p className="text-gray-500 text-sm">
            Please check the URL or try browsing other stores.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/store-builder">
              <Store className="w-4 h-4 mr-2" />
              Create Store
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreNotFound;
