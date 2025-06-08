
import React from 'react';
import ModernProductCard from './ModernProductCard';
import { Tables } from '@/integrations/supabase/types';

interface ProductGridProps {
  products: Tables<'products'>[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No products available</h3>
        <p className="text-muted-foreground">Check back soon for new products!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ModernProductCard 
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
