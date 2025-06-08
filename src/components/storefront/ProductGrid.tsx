
import React from 'react';
import StorefrontProductCard from './StorefrontProductCard';
import { Tables } from '@/integrations/supabase/types';

interface ProductGridProps {
  products: Tables<'products'>[];
  viewMode?: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, viewMode = 'grid' }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
          <p className="text-gray-600">Check back later for new products!</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <StorefrontProductCard
            key={product.id}
            product={product}
            viewMode="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <StorefrontProductCard
          key={product.id}
          product={product}
          viewMode="grid"
        />
      ))}
    </div>
  );
};

export default ProductGrid;
