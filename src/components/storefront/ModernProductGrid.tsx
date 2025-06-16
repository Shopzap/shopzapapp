
import React from 'react';
import ModernProductCard from './ModernProductCard';
import { Tables } from '@/integrations/supabase/types';

interface ModernProductGridProps {
  products: Tables<'products'>[];
  storeName: string;
  viewMode?: 'grid' | 'list';
  buttonColor?: string;
  buttonTextColor?: string;
}

const ModernProductGrid: React.FC<ModernProductGridProps> = ({ 
  products, 
  storeName,
  viewMode = 'grid',
  buttonColor,
  buttonTextColor 
}) => {
  console.log('ModernProductGrid: Rendering with', products.length, 'products');

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-sm mx-auto px-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 text-sm">
            This store is getting ready to launch amazing products. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3 sm:space-y-4">
        {products.map((product) => (
          <ModernProductCard
            key={product.id}
            product={product}
            storeName={storeName}
            buttonColor={buttonColor}
            buttonTextColor={buttonTextColor}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product) => (
        <ModernProductCard
          key={product.id}
          product={product}
          storeName={storeName}
          buttonColor={buttonColor}
          buttonTextColor={buttonTextColor}
        />
      ))}
    </div>
  );
};

export default ModernProductGrid;
