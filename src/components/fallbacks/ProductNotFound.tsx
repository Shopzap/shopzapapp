
import React from 'react';
import { Package, ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProductNotFoundProps {
  productName?: string;
  storeName?: string;
  onRetry?: () => void;
}

const ProductNotFound: React.FC<ProductNotFoundProps> = ({ 
  productName, 
  storeName,
  onRetry 
}) => {
  const navigate = useNavigate();

  const handleBackToStore = () => {
    if (storeName) {
      navigate(`/store/${storeName}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          {productName ? (
            <p className="text-gray-600">
              The product "{productName}" is no longer available or has been moved.
            </p>
          ) : (
            <p className="text-gray-600">
              This product is no longer available or doesn't exist.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {storeName && (
            <Button
              onClick={handleBackToStore}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {storeName}
            </Button>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Browse Stores
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

export default ProductNotFound;
