
import React from "react";
import StorefrontProductCard from "./StorefrontProductCard";
import { Tables } from "@/integrations/supabase/types";

interface ProductGridProps {
  products: Tables<"products">[];
  viewMode?: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, viewMode = 'grid' }) => {
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
