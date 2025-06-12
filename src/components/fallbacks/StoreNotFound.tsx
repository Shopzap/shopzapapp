
import React from 'react';
import { Store, Home, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StoreNotFoundProps {
  storeName?: string;
  onRetry?: () => void;
}

const StoreNotFound: React.FC<StoreNotFoundProps> = ({ 
  storeName,
  onRetry 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
          {storeName ? (
            <p className="text-gray-600">
              The store "{storeName}" doesn't exist or is currently unavailable.
            </p>
          ) : (
            <p className="text-gray-600">
              This store doesn't exist or is currently unavailable.
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Looking for a specific store? Try checking the URL or browse other stores on ShopZap.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Browse All Stores
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Store
            </Button>
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="flex-1"
              >
                <Search className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t">
          Powered by <span className="font-semibold text-purple-600">ShopZap.io</span>
        </div>
      </div>
    </div>
  );
};

export default StoreNotFound;
