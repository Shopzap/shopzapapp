
import React from "react";
import StorefrontProductCard from "./StorefrontProductCard";
import { Tables } from "@/integrations/supabase/types";

interface ProductGridProps {
  products: Tables<"products">[];
  viewMode?: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, viewMode = 'grid' }) => {
  // Handle empty products case
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found for this store</h3>
        <p className="text-gray-500">This store hasn't added any products yet or products are currently unavailable.</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <StorefrontProductCard key={product.id} product={product} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <StorefrontProductCard key={product.id} product={product} viewMode="grid" />
      ))}
    </div>
  );
};

export default ProductGrid;
