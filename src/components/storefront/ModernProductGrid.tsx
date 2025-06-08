
import React from 'react';
import ModernProductCard from './ModernProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  store_id: string;
}

interface ModernProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
}

const ModernProductGrid: React.FC<ModernProductGridProps> = ({ 
  products, 
  viewMode = 'grid' 
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-sm mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 text-sm">
            This store is getting ready to launch amazing products. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ModernProductCard
            key={product.id}
            product={product}
            viewMode="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ModernProductCard
          key={product.id}
          product={product}
          viewMode="grid"
        />
      ))}
    </div>
  );
};

export default ModernProductGrid;
