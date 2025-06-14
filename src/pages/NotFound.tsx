
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Frown } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Frown className="mx-auto h-24 w-24 text-gray-400" />
          <h1 className="mt-6 text-6xl font-extrabold text-gray-900 tracking-tight sm:text-7xl">
            404
          </h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">Page Not Found</h2>
          <p className="mt-2 text-base text-gray-600">
            Oops! The page you’re looking for doesn’t exist. It might have been moved or deleted.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Take me Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
