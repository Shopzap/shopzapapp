
import React from "react";
import StorefrontProductCard from "./StorefrontProductCard";
import { Tables } from "@/integrations/supabase/types";

interface ProductGridProps {
  products: Tables<"products">[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <StorefrontProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
