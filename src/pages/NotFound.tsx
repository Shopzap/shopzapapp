
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Store } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from a store route
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isFromStore = pathSegments[0] === 'store' && pathSegments[1];
  const storeName = isFromStore ? pathSegments[1] : null;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleBackToStore = () => {
    if (storeName) {
      navigate(`/store/${storeName}`);
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-9xl font-bold text-gray-300">404</div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isFromStore && storeName && (
            <Button onClick={handleBackToStore}>
              <Store className="w-4 h-4 mr-2" />
              Back to {storeName}
            </Button>
          )}
          
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Button variant="outline" onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        {isFromStore && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p>
              Looking for a specific product or page in this store? 
              Try browsing from the store homepage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
