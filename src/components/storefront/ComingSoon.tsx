
import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useParams } from 'react-router-dom';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title = "Coming Soon",
  description = "This page is under construction. Please check back later!"
}) => {
  const { storeName } = useParams<{ storeName: string }>();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Construction className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <Button asChild>
          <Link to={storeName ? `/store/${storeName}` : '/'}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ComingSoon;
